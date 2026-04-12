from Backend_user.Database import Database
from Backend_user.config import Config

def run_migration():
    db = Database()
    cursor = None
    try:
        cursor = db.get_cursor()
        
        # 1. Update users table
        print("Adding 'active' column to users table...")
        try:
            cursor.execute("ALTER TABLE users ADD COLUMN active BOOLEAN NOT NULL DEFAULT TRUE")
            db.commit()
            print("Successfully added 'active' column.")
        except Exception as e:
            if "Duplicate column name" in str(e):
                print("'active' column already exists.")
            else:
                print(f"Error adding 'active' column: {e}")

        # 2. Create announcements table
        print("Creating announcements table...")
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS announcements (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                content TEXT NOT NULL,
                category VARCHAR(64) NULL,
                date DATE NOT NULL,
                is_pinned BOOLEAN NOT NULL DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        """)
        db.commit()
        print("Successfully ensured announcements table.")

    except Exception as e:
        print(f"Migration failed: {e}")
    finally:
        if cursor:
            cursor.close()
        db.close()

if __name__ == "__main__":
    run_migration()
