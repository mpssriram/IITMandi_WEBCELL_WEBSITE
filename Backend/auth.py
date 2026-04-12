import logging

from fastapi import Depends, Header, HTTPException, status

try:
    from .config import Config
    from .firebase_admin_setup import FirebaseService, FirebaseServiceError
except ImportError:
    from config import Config
    from firebase_admin_setup import FirebaseService, FirebaseServiceError


class AuthDependencies:
    """
    Authentication and authorization dependencies for FastAPI routes.
    """

    def __init__(
        self,
        firebase_service: FirebaseService | None = None,
        config: Config | None = None,
    ):
        self.firebase_service = firebase_service or FirebaseService()
        self.config = config or Config()
        self.logger = logging.getLogger(__name__)

    def _normalize_email(self, email):
        return str(email or "").strip().lower()

    def _normalize_uid(self, uid):
        return str(uid or "").strip()

    def _matches_admin_allowlist(self, user: dict):
        normalized_uid = self._normalize_uid(
            user.get("uid") or user.get("firebase_uid") or user.get("user_id") or user.get("sub")
        )
        normalized_email = self._normalize_email(user.get("email"))

        if self.config.ADMIN_UIDS and normalized_uid and normalized_uid in self.config.ADMIN_UIDS:
            return True

        if self.config.ADMIN_EMAILS and normalized_email and normalized_email in self.config.ADMIN_EMAILS:
            return True

        return False

    def is_admin_user(self, user: dict):
        if self.config.ADMIN_UIDS or self.config.ADMIN_EMAILS:
            return self._matches_admin_allowlist(user)

        return bool(user.get("admin", False) or user.get("role") == "admin")

    def _normalize_identity(self, decoded_token: dict):
        uid = decoded_token.get("uid") or decoded_token.get("user_id") or decoded_token.get("sub")
        email = decoded_token.get("email")
        name = (
            decoded_token.get("name")
            or decoded_token.get("display_name")
            or decoded_token.get("given_name")
            or decoded_token.get("email")
        )
        picture = decoded_token.get("picture") or decoded_token.get("photo_url")

        if not uid:
            self.logger.warning("Firebase token decoded but uid/sub/user_id claim missing")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Unable to extract Firebase user identity from token.",
            )

        normalized = dict(decoded_token)
        normalized["uid"] = uid
        normalized["email"] = email
        normalized["name"] = name
        normalized["picture"] = picture
        return normalized

    def get_current_user(self, authorization: str | None = Header(default=None)):
        """
        Validate the Bearer token and return the decoded Firebase user.
        """
        if not authorization:
            self.logger.info("Authorization header missing")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Authorization header is missing.",
            )

        self.logger.debug("Authorization header received", extra={"authorization_prefix": authorization[:12]})

        parts = authorization.strip().split(" ", 1)
        if len(parts) != 2 or parts[0].lower() != "bearer" or not parts[1].strip():
            self.logger.info("Malformed authorization header format")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authorization header format.",
            )

        token = parts[1].strip()
        self.logger.debug("Bearer token extracted", extra={"token_preview": f"{token[:10]}...", "token_length": len(token)})

        try:
            decoded_token = self.firebase_service.verify_token(token)
        except FirebaseServiceError as exc:
            self.logger.exception("Firebase token verification failed")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Unable to verify Firebase token.",
            ) from exc

        if decoded_token is None:
            self.logger.info("Firebase token invalid or expired")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired Firebase token.",
            )

        self.logger.debug("Firebase token decoded successfully")

        normalized = self._normalize_identity(decoded_token)
        self.logger.info(
            "Firebase identity extracted",
            extra={
                "uid": normalized.get("uid"),
                "email": normalized.get("email"),
            },
        )

        return normalized

    def get_current_admin(self, user=Depends(get_current_user)):
        """
        Temporary admin check.

        Later, this can be replaced with a database role lookup.
        """
        is_admin = self.is_admin_user(user)

        if not is_admin:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Admin access required.",
            )

        return user


auth_dependencies = AuthDependencies()
