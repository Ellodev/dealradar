import re
import requests
from bs4 import BeautifulSoup
import psycopg2
from config import load_config

def connect(config):
    try:
        with psycopg2.connect(**config) as conn:
            print('Connected to the PostgreSQL server.')
            return conn
    except (psycopg2.DatabaseError, Exception) as error:
        print(error)
        return None

def get_all_products(conn):
    sql = """SELECT id, url FROM products"""
    
    try:
        with conn.cursor() as cur:
            cur.execute(sql)
            return cur.fetchall()
    except (Exception, psycopg2.DatabaseError) as error:
        print(error)
        return []

def insert_price(conn, product_id, price):
    sql = """INSERT INTO price (product_id, price) VALUES (%s, %s)"""
    
    try:
        with conn.cursor() as cur:
            cur.execute(sql, (product_id, price))
            conn.commit()
    except (Exception, psycopg2.DatabaseError) as error:
        print(error)

def insert_price_products_table(conn, price, product_id):
    sql = """UPDATE products SET price = %s WHERE id = %s"""
    
    try:
        with conn.cursor() as cur:
            cur.execute(sql, (price, product_id))
            conn.commit()
    except (Exception, psycopg2.DatabaseError) as error:
        print(error)

def update_prices():
    config = load_config()
    conn = connect(config)
    
    if conn is None:
        print("Failed to connect to the database.")
        return

    products = get_all_products(conn)
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.82 Safari/537.36"
    }

    for product in products:
        product_id, url = product
        
        try:
            response = requests.get(url, headers=headers)
            response.raise_for_status()
        except requests.RequestException as e:
            print(f"Failed to fetch URL: {e}")
            continue

        soup = BeautifulSoup(response.content, "lxml")
        price_element = soup.find(attrs={"data-testid": "product-price"})

        if price_element:
            full_price_text = price_element.text.strip()
            match = re.search(r"\d+[\’']?\d*\.\d{2}", full_price_text)
            if match:
                first_price = match.group().replace("’", "").replace("'", "")
                insert_price(conn, product_id, first_price)
                insert_price_products_table(conn, first_price, product_id)
                print(f"Updated price for product {product_id}: {first_price}")
            else:
                print(f"No valid price found for product {product_id}")
        else:
            print(f"Price element not found for product {product_id}")

    conn.close()
    print("Prices updated.")

if __name__ == "__main__":
    update_prices()