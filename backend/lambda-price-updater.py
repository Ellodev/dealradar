import os
import re
import requests
from bs4 import BeautifulSoup
import psycopg2

def load_config():
    return {
        "host": os.getenv("DB_HOST"),
        "database": os.getenv("DB_NAME"),
        "user": os.getenv("DB_USER"),
        "password": os.getenv("DB_PASSWORD"),
        "port": os.getenv("DB_PORT", 5432),
    }

def connect(config):
    try:
        return psycopg2.connect(**config)
    except Exception as error:
        print(f"Database connection failed: {error}")
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
    if not conn:
        return

    products = get_all_products(conn)
    headers = {"User-Agent": "Mozilla/5.0"}
    for product_id, url in products:
        try:
            response = requests.get(url, headers=headers, timeout=10)
            response.raise_for_status()
        except requests.RequestException as e:
            print(f"Request failed for {url}: {e}")
            continue

        soup = BeautifulSoup(response.content, "lxml")
        price_element = soup.find(attrs={"data-testid": "product-price"})
        if price_element:
            match = re.search(r"\d+[\’']?\d*\.\d{2}", price_element.text.strip())
            if match:
                price = match.group().replace("’", "").replace("'", "")
                insert_price(conn, product_id, price)
                insert_price_products_table(conn, price, product_id)
    conn.close()

def lambda_handler(event, context):
    update_prices()
    return {"statusCode": 200, "body": "Prices updated successfully"}
