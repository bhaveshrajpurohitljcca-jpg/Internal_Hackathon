import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

try:
    conn = psycopg2.connect(user="postgres", password="root123", host="localhost", port="5432", database="postgres")
    conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
    cursor = conn.cursor()
    cursor.execute("SELECT 1 FROM pg_catalog.pg_database WHERE datname = 'hackathon_portal'")
    exists = cursor.fetchone()
    if not exists:
        cursor.execute("CREATE DATABASE hackathon_portal")
        print("Database created successfully")
    else:
        print("Database already exists")
    cursor.close()
    conn.close()
except Exception as e:
    print("Error:", e)
