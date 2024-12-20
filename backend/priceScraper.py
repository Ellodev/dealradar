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

def insert_data(url, price):

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

    sql = """INSERT INTO products (url, price) VALUES (%s, %s)"""

    config = load_config()

    try: 
        with psycopg2.connect(**config) as conn:
            with conn.cursor() as cur:
                cur.execute(sql, (url, price))
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

    soup = BeautifulSoup(response.content, "lxml")
    price_element = soup.find(attrs={"data-testid": "product-price"})

    if price_element:
        full_price_text = price_element.text.strip()
        match = re.search(r"\d+[\’']?\d*\.\d{2}", full_price_text)
        if match:
            first_price = match.group().replace("’", "").replace("'", "")

            insert_data(url, first_price)

            return jsonify({"price": first_price})
        else:
            return jsonify({"error": "No valid price found"}), 404
    else:
        return jsonify({"error": "Price element not found"}), 404

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
