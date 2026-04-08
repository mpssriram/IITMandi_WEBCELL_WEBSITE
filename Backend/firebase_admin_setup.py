from pathlib import Path

import firebase_admin
from firebase_admin import auth, credentials

try:
    from .config import Config
except ImportError:
    from config import Config


class FirebaseServiceError(Exception):
    """Raised when Firebase Admin setup fails."""


class FirebaseService:
    """
    Small service class for Firebase Admin SDK setup and token verification.
    """

    _app = None

    def __init__(self, config: Config | None = None):
        self.config = config or Config()

    def initialize(self):
        """
        Initialize Firebase Admin only once.
        """
        if FirebaseService._app is not None:
            return FirebaseService._app

        service_account_path = self.config.FIREBASE_SERVICE_ACCOUNT_PATH
        if not service_account_path:
            raise FirebaseServiceError("Firebase service account path is missing.")

        service_account_path = Path(service_account_path)
        if not service_account_path.exists():
            raise FirebaseServiceError(
                f"Firebase service account file not found: {service_account_path}"
            )

        try:
            credential = credentials.Certificate(str(service_account_path))
            options = {}

            if self.config.FIREBASE_STORAGE_BUCKET:
                options["storageBucket"] = self.config.FIREBASE_STORAGE_BUCKET

            FirebaseService._app = firebase_admin.initialize_app(credential, options)
            return FirebaseService._app
        except Exception as exc:
            raise FirebaseServiceError(f"Failed to initialize Firebase Admin: {exc}") from exc

    def verify_token(self, token: str):
        """
        Verify a Firebase ID token and return decoded user data.

        Returns None for invalid tokens.
        Raises FirebaseServiceError for setup-related problems.
        """
        self.initialize()

        try:
            return auth.verify_id_token(token)
        except (
            auth.InvalidIdTokenError,
            auth.ExpiredIdTokenError,
            auth.RevokedIdTokenError,
            ValueError,
        ):
            return None
        except Exception as exc:
            raise FirebaseServiceError(f"Failed to verify Firebase token: {exc}") from exc
