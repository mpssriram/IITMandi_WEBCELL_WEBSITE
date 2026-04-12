import firebase_admin
from firebase_admin import credentials, auth, firestore

try:
    # Attempt to initialize using existing default app
    firebase_admin.get_app()
except ValueError:
    # Initialize from the credential file in the project
    cred = credentials.Certificate("Backend/firebase-adminsdk.json")
    firebase_admin.initialize_app(cred)

db = firestore.client()

def create_admin():
    email = "admin@iitmandi.ac.in"
    password = "adminpassword123"
    
    try:
        # Check if user already exists
        user = auth.get_user_by_email(email)
        print(f"User {email} already exists with UID: {user.uid}")
    except auth.UserNotFoundError:
        # Create new user
        user = auth.create_user(
            email=email,
            password=password,
            email_verified=True,
            display_name="DevCell SuperAdmin"
        )
        print(f"Successfully created new admin user with UID: {user.uid}")
    
    # Write directly to the admins collection to assign admin roles
    admin_ref = db.collection('admins').document(user.uid)
    admin_ref.set({
        "email": email,
        "role": "admin",
        "admin": True
    }, merge=True)
    
    print("Successfully mapped 'admin' role in Firestore.")

if __name__ == "__main__":
    create_admin()
