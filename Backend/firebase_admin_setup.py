from pathlib import Path

import firebase_admin
from firebase_admin import auth, credentials
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token as google_id_token

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
        try:
            self.initialize()
            return auth.verify_id_token(token)
        except FirebaseServiceError:
            # Fallback for setups where only firebase web config is present.
            return self._verify_token_without_admin(token)
        except (
            auth.InvalidIdTokenError,
            auth.ExpiredIdTokenError,
            auth.RevokedIdTokenError,
            ValueError,
        ):
            return None
        except Exception as exc:
            raise FirebaseServiceError(f"Failed to verify Firebase token: {exc}") from exc

    def _verify_token_without_admin(self, token: str):
        """
        Verify Firebase token using Google's public certs when Admin SDK
        cannot be initialized from a service-account file.
        """
        project_id = (
            self.config.FIREBASE_WEB_CONFIG.get("projectId")
            or self.config.FIREBASE_CONFIG_JSON.get("project_id")
        )

        if not project_id:
            raise FirebaseServiceError(
                "Firebase project ID missing. Set firebaseConfig.projectId or use a service account JSON."
            )

        try:
            request = google_requests.Request()
            return google_id_token.verify_firebase_token(token, request, audience=project_id)
        except ValueError:
            return None
        except Exception as exc:
            raise FirebaseServiceError(f"Failed to verify Firebase token: {exc}") from exc
