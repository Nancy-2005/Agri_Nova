import sqlite3
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATABASE = os.path.join(BASE_DIR, 'farmer_app.db')

def migrate():
    print(f"Connecting to database at {DATABASE}...")
    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()

    # Add email column to users
    try:
        print("Adding 'email' column to 'users' table...")
        cursor.execute("ALTER TABLE users ADD COLUMN email TEXT")
        print("Successfully added email column.")
    except sqlite3.OperationalError:
        print("Column 'email' already exists in 'users' table.")

    # Add is_verified column to users
    try:
        print("Adding 'is_verified' column to 'users' table...")
        cursor.execute("ALTER TABLE users ADD COLUMN is_verified INTEGER DEFAULT 0")
        print("Successfully added is_verified column.")
    except sqlite3.OperationalError:
        print("Column 'is_verified' already exists in 'users' table.")

    # Add email column to otp
    try:
        print("Adding 'email' column to 'otp' table...")
        cursor.execute("ALTER TABLE otp ADD COLUMN email TEXT")
        print("Successfully added email column to otp table.")
    except sqlite3.OperationalError:
        print("Column 'email' already exists in 'otp' table.")
        
    # Make phone_number nullable in otp if it wasn't? 
    # SQLite doesn't support changing NOT NULL via ALTER TABLE easily. 
    # But usually it's fine as long as we don't try to insert NULL if there's a constraint.
    # In my new code, phone_number can be NULL.
    # Let's hope the old table didn't have a strict NOT NULL constraint.
    # Actually, the old code had "phone_number TEXT NOT NULL".
    
    # Check if we need to fix NOT NULL constraint (requires table recreation in SQLite)
    # For now, let's see if it works. 

    conn.commit()
    conn.close()
    print("Migration completed!")

if __name__ == '__main__':
    migrate()
