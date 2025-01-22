from flask import Flask, request, jsonify
import re
import requests
from bs4 import BeautifulSoup
from flask_cors import CORS

import psycopg2
from config import load_config

def connect(config):
    try:
        # connecting to the PostgreSQL server
        with psycopg2.connect(**config) as conn:
            print('Connected to the PostgreSQL server.')
            return conn
    except (psycopg2.DatabaseError, Exception) as error:
        print(error)


if __name__ == '__main__':
    config = load_config()
    connect(config)

app = Flask(__name__)
CORS(app)

def insert_data(url, price, productName, productDescription, image):

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

    sql = """INSERT INTO products (url, price, product_name, product_description, image) VALUES (%s, %s, %s, %s, %s)"""

    config = load_config()

    try: 
        with psycopg2.connect(**config) as conn:
            with conn.cursor() as cur:
                cur.execute(sql, (url, price, productName, productDescription, image))
                conn.commit()
    except (Exception, psycopg2.DatabaseError) as error:
        print(error)

@app.route('/scrape-price', methods=['GET'])
def scrape_price():
    url = request.args.get('url')
    if not url:
        return jsonify({"error": "URL parameter is required"}), 400

    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.82 Safari/537.36"
    }

    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()
    except requests.RequestException as e:
        return jsonify({"error": f"Failed to fetch URL: {e}"}), 500

    soup = BeautifulSoup(response.content, "html.parser")
    price_element = soup.find(attrs={"data-testid": "product-price"})

    productName_element = soup.find(attrs={"class": "text-text-default-primary text-3xl lg:text-4xl font-secondary"})

    if productName_element:
        productName = productName_element.text.strip()

    productDescription_element = soup.find(attrs={"data-testid": "text-clamp"})

    if productDescription_element:
        productDescription = productDescription_element.text.strip()

    productImages = [img['src'] for img in soup.find_all(attrs={"class": "mx-auto object-contain p-2"}) if 'src' in img.attrs]
    primaryImageWithoutUrl = productImages[0] if productImages else None
    additionalImages = productImages[1:] if len(productImages) > 1 else []

    primaryImage = "https://www.interdiscount.ch" + primaryImageWithoutUrl

    print("Primary Image:", primaryImage)
    print("Additional Images:", additionalImages)

    if price_element:
        full_price_text = price_element.text.strip()
        match = re.search(r"\d+[’']?\d*(?:\.\d{2})?(?:–)?(?:\sstatt\s\d+[’']?\d*(?:\.\d{2})?(?:–)?)?", full_price_text)
        if match:
            first_price = match.group().replace("’", "").replace("'", "")

            insert_data(url, first_price, productName, productDescription, primaryImage)

            return jsonify({"price": first_price, "productName": productName, "productDescription": productDescription, "image": primaryImage})
        else:
            return jsonify({"error": "No valid price found"}), 404
    else:
        return jsonify({"error": "Price element not found"}), 404
    
    

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
