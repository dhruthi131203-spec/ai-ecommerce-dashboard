from flask import Flask, request, jsonify
from flask_cors import CORS
from db import conn
from model import predict_sales

app = Flask(__name__)
CORS(app)

# Home route
@app.route('/')
def home():
    return "Backend Running!"

# Add data to PostgreSQL
@app.route('/add-data', methods=['POST'])
def add_data():
    try:
        data = request.json

        cursor = conn.cursor()

        query = """
        INSERT INTO sales (customer_id, product, amount, date)
        VALUES (%s, %s, %s, %s)
        """

        values = (
            data['customer_id'],
            data['product'],
            data['amount'],
            data['date']
        )

        cursor.execute(query, values)
        conn.commit()

        return jsonify({"message": "Data added successfully"})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# Fetch data
@app.route('/get-data', methods=['GET'])
def get_data():
    try:
        cursor = conn.cursor()

        cursor.execute("SELECT customer_id, product, amount, date FROM sales")
        rows = cursor.fetchall()

        data = []
        for row in rows:
            data.append({
                "customer_id": row[0],
                "product": row[1],
                "amount": row[2],
                "date": str(row[3])
            })

        return jsonify(data)

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# AI prediction
@app.route('/predict', methods=['GET'])
def predict():
    try:
        day = int(request.args.get('day'))
        result = predict_sales(day)

        return jsonify({"prediction": float(result)})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# Recommendation
@app.route('/recommend', methods=['GET'])
def recommend():
    return jsonify({"product": "Laptop"})


if __name__ == '__main__':
    import os
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5000)))