from flask import Flask, request, jsonify
from flask_cors import CORS
from db import conn, cursor
from model import predict_sales

app = Flask(__name__)
CORS(app)

# Home route
@app.route('/')
def home():
    return "Backend Running!"

# Add data to MySQL
@app.route('/add-data', methods=['POST'])
def add_data():
    data = request.json

    
    cursor = conn.cursor()

    query = "INSERT INTO sales_data (customer_id, product, amount, purchase_date) VALUES (%s, %s, %s, %s)"
    values = (data['customer_id'], data['product'], data['amount'], data['date'])

    cursor.execute(query, values)
    conn.commit()

    return jsonify({"message": "Data added successfully"})

# Fetch data
@app.route('/get-data', methods=['GET'])
def get_data():
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("SELECT * FROM sales_data")
    data = cursor.fetchall()

    return jsonify(data)

# AI prediction
@app.route('/predict', methods=['GET'])
def predict():
    day = int(request.args.get('day'))
    result = predict_sales(day)

    return jsonify({"prediction": float(result)})

# Recommendation (extra feature)
@app.route('/recommend', methods=['GET'])
def recommend():
    return jsonify({"product": "Laptop"})

if __name__ == '__main__':
    import os

app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5000)))