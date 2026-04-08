import sqlite3
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATABASE = os.path.join(BASE_DIR, 'farmer_app.db')

def check_and_fix():
    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()
    
    print("Checking 'users' table...")
    cursor.execute("PRAGMA table_info(users)")
    columns = {row[1]: row for row in cursor.fetchall()}
    
    # row format: (id, name, type, notnull, dflt_value, pk)
    phone_notnull = columns.get('phone_number')[3] if 'phone_number' in columns else 0
    
    print("Checking 'otp' table...")
    cursor.execute("PRAGMA table_info(otp)")
    otp_columns = {row[1]: row for row in cursor.fetchall()}
    otp_phone_notnull = otp_columns.get('phone_number')[3] if 'phone_number' in otp_columns else 0
    
    print(f"Users phone_number NOT NULL: {phone_notnull}")
    print(f"Otp phone_number NOT NULL: {otp_phone_notnull}")
    
    if phone_notnull or otp_phone_notnull:
        print("Fixing constraints by recreating tables...")
        
        # 1. Users Table
        cursor.execute("CREATE TABLE users_new AS SELECT * FROM users")
        cursor.execute("DROP TABLE users")
        cursor.execute('''
            CREATE TABLE users (
                user_id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                phone_number TEXT UNIQUE,
                email TEXT UNIQUE,
                password_hash TEXT NOT NULL,
                district TEXT NOT NULL,
                is_verified INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        # Migrate data back
        # Note: users_new might not have 'email' or 'is_verified' if the previous migration failed partially
        # But migrate_auth.py should have added them.
        existing_cols = [c[1] for c in columns.values()]
        cols_to_copy = [c for c in existing_cols if c in ['user_id', 'name', 'phone_number', 'email', 'password_hash', 'district', 'is_verified', 'created_at']]
        cols_str = ", ".join(cols_to_copy)
        cursor.execute(f"INSERT INTO users ({cols_str}) SELECT {cols_str} FROM users_new")
        cursor.execute("DROP TABLE users_new")
        
        # 2. OTP Table
        cursor.execute("CREATE TABLE otp_new AS SELECT * FROM otp")
        cursor.execute("DROP TABLE otp")
        cursor.execute('''
            CREATE TABLE otp (
                otp_id INTEGER PRIMARY KEY AUTOINCREMENT,
                phone_number TEXT,
                email TEXT,
                otp_code TEXT NOT NULL,
                name TEXT,
                district TEXT,
                attempts INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                expires_at TIMESTAMP NOT NULL
            )
        ''')
        otp_existing_cols = [c[1] for c in otp_columns.values()]
        otp_cols_to_copy = [c for c in otp_existing_cols if c in ['otp_id', 'phone_number', 'email', 'otp_code', 'name', 'district', 'attempts', 'created_at', 'expires_at']]
        otp_cols_str = ", ".join(otp_cols_to_copy)
        cursor.execute(f"INSERT INTO otp ({otp_cols_str}) SELECT {otp_cols_str} FROM otp_new")
        cursor.execute("DROP TABLE otp_new")
        
        conn.commit()
        print("Tables recreated with correct constraints.")
    else:
        print("Constraints are already correct.")
    
    conn.close()

if __name__ == '__main__':
    check_and_fix()
