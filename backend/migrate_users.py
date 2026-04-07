import sqlite3

def migrate():
    conn = sqlite3.connect('farmer_app.db')
    cursor = conn.cursor()
    
    # 1. Disable PRAGMA foreign_keys just in case
    cursor.execute('PRAGMA foreign_keys=OFF;')
    
    # 2. Get existing users
    cursor.execute('SELECT id, name, phone, password_hash, district, created_at FROM users')
    users = cursor.fetchall()
    
    # 3. Rename old table
    cursor.execute('ALTER TABLE users RENAME TO old_users;')
    
    # 4. Create new table matching models.py exactly
    cursor.execute('''
        CREATE TABLE users (
            user_id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            phone_number TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            district TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # 5. Insert data from old table
    for u in users:
        try:
            cursor.execute('''
                INSERT INTO users (user_id, name, phone_number, password_hash, district, created_at)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (u[0], u[1], u[2] or f'UNKNOWN_{u[0]}', u[3], u[4], u[5]))
        except Exception as e:
            print(f"Failed to insert user {u[0]}: {e}")
            
    # 6. Drop old table
    cursor.execute('DROP TABLE old_users;')
    
    conn.commit()
    conn.close()
    print('Migration complete.')

if __name__ == '__main__':
    migrate()
