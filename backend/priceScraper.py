from flask import Flask, request, jsonify
import re
import requests
from bs4 import BeautifulSoup
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

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
            return jsonify({"price": first_price})
        else:
            return jsonify({"error": "No valid price found"}), 404
    else:
        return jsonify({"error": "Price element not found"}), 404

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
