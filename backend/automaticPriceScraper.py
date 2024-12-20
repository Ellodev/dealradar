import time
import re
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from bs4 import BeautifulSoup
import psycopg2
from config import load_config

# Function to connect to PostgreSQL database
def connect(config):
    try:
        # Connecting to PostgreSQL server
        with psycopg2.connect(**config) as conn:
            print('Connected to the PostgreSQL server.')
            return conn
    except (psycopg2.DatabaseError, Exception) as error:
        print(error)

# Function to insert product data into the database
def insert_data(url, price, productName, productDescription):
    def check_url(url):
        sql = """SELECT * FROM products WHERE url = %s"""

        config = load_config()

        try:
            with psycopg2.connect(**config) as conn:
                with conn.cursor() as cur:
                    cur.execute(sql, (url,))
                    return cur.fetchone()
        except (Exception, psycopg2.DatabaseError) as error:
            print(error)

    if check_url(url):
        return        

    sql = """INSERT INTO products (url, price, product_name, product_description) VALUES (%s, %s, %s, %s)"""

    config = load_config()

    try: 
        with psycopg2.connect(**config) as conn:
            with conn.cursor() as cur:
                cur.execute(sql, (url, price, productName, productDescription))
                conn.commit()
    except (Exception, psycopg2.DatabaseError) as error:
        print(error)

# Function to scrape product details
def scrape_price(url, driver):
    driver.get(url)
    
    try:
        # Wait for the product name, price, and description to load
        WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.CLASS_NAME, "product-detail-name")))

        soup = BeautifulSoup(driver.page_source, "lxml")

        # Find the product name
        productName_element = soup.find(attrs={"class": "product-detail-name"})
        productName = productName_element.text.strip() if productName_element else "No name found"

        # Find the product price
        price_element = soup.find(attrs={"data-testid": "product-price"})
        if price_element:
            price_text = price_element.text.strip()
            # Clean up price text and format it
            match = re.search(r"\d+[\’']?\d*\.\d{2}", price_text)
            if match:
                price = match.group().replace("’", "").replace("'", "")
            else:
                price = "No price found"
        else:
            price = "Price not available"

        # Find the product description
        productDescription_element = soup.find(attrs={"data-testid": "text-clamp"})
        productDescription = productDescription_element.text.strip() if productDescription_element else "No description found"

        # Insert the data into the database
        insert_data(url, price, productName, productDescription)

        print(f"Inserted product: {productName} with price {price}")

    except Exception as e:
        print(f"Failed to scrape {url}: {e}")

# Function to extract product links from the category page
def get_product_links(category_url, driver):
    driver.get(category_url)
    
    try:
        # Wait until product links are loaded (adjust the class name if necessary)
        WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.CSS_SELECTOR, "a.absolute.z-[2].size-full")))
        
        soup = BeautifulSoup(driver.page_source, "lxml")

        # Extract all product links from the 'aria-label' attribute
        product_links = soup.find_all('a', {'class': 'absolute z-[2] size-full'})

        # Extract the href attributes from the product links
        product_urls = [link.get('href') for link in product_links if link.get('href')]

        # Debug: Check extracted product URLs
        if not product_urls:
            print("No product links found.")
        else:
            print(f"Found {len(product_urls)} product links.")

        return product_urls

    except Exception as e:
        print(f"Failed to get product links from {category_url}: {e}")
        return []

# Function to scrape all products in the category
def scrape_all_products(category_url, driver):
    # Get all product links from the category page
    product_urls = get_product_links(category_url, driver)

    # If there are no product links, stop the scraping process
    if not product_urls:
        print("No product links found.")
        return

    for relative_url in product_urls:
        # Form the full product URL
        full_url = f"https://www.interdiscount.ch{relative_url}"
        print(f"Scraping product: {full_url}")
        
        # Scrape the product details
        scrape_price(full_url, driver)
        
        # Wait 10 seconds before scraping the next product
        print(f"Waiting 10 seconds before scraping the next product...")
        time.sleep(10)

# Main function to set up the driver and start scraping
if __name__ == '__main__':
    config = load_config()
    connect(config)

    # Set up headless browser with Selenium
    chrome_options = Options()
    chrome_options.add_argument("--headless")  # Run in headless mode (no GUI)
    chrome_options.add_argument("--disable-gpu")  # Disable GPU acceleration (optional)
    
    driver = webdriver.Chrome(options=chrome_options)

    # URL for the TV & Audio category page
    category_url = "https://www.interdiscount.ch/de/tv-audio--c100"
    scrape_all_products(category_url, driver)

    # Close the browser after scraping
    driver.quit()
