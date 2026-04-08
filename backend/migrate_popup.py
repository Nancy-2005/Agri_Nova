import sqlite3
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATABASE = os.path.join(BASE_DIR, 'farmer_app.db')

def migrate():
    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()

    try:
        print("Adding 'last_guidance_shown' column to 'users' table...")
        cursor.execute("ALTER TABLE users ADD COLUMN last_guidance_shown DATE")
        print("Success.")
    except sqlite3.OperationalError:
        print("Column already exists.")

    conn.commit()
    conn.close()

if __name__ == '__main__':
    migrate()
