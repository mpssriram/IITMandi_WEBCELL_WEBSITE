import sys
import os

# Add the current directory and Backend_user to the path so we can import the modules
sys.path.append(os.getcwd())

try:
    from Backend_user.Database import Database
    from Backend_user.config import Config
except ImportError:
    print("Could not import Database or Config. Make sure you are in the project root.")
    sys.exit(1)

def promote_to_admin(uid):
    config = Config()
    db = Database(config=config)
    
    cursor = None
    try:
        cursor = db.get_cursor()
        
        # Check if user exists
        cursor.execute("SELECT id, email, role FROM users WHERE firebase_uid = %s", (uid,))
        user = cursor.fetchone()
        
        if user:
            print(f"Found user: {user['email']} (ID: {user['id']}) with current role: {user['role']}")
            cursor.execute("UPDATE users SET role = 'admin' WHERE firebase_uid = %s", (uid,))
            db.commit()
            print(f"Successfully promoted UID {uid} to admin in MySQL.")
        else:
            print(f"User with UID {uid} not found in MySQL. They might need to log in once first to auto-provision, or you can insert them manually.")
            # Let's try to find them by email if we can't find by UID? No, UID is specific.
            # I'll offer to insert them if they provide an email.
            
    except Exception as e:
        print(f"Error: {e}")
    finally:
        if cursor:
            cursor.close()
        db.close()

if __name__ == "__main__":
    target_uid = "1S7mNvje9zcjVI9CCn56HKXo4Ur1"
    promote_to_admin(target_uid)
