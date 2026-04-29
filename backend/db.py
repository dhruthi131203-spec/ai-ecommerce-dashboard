import mysql.connector

def get_connection():
    return mysql.connector.connect(
        host="localhost",
        user="project_user",
        password="1234",
        database="ecommerce_ai",
        port=3306
    )