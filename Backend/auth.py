from fastapi import Depends, Header, HTTPException, status

from firebase_admin_setup import FirebaseService, FirebaseServiceError


class AuthDependencies:
    """
    Authentication and authorization dependencies for FastAPI routes.
    """

    def __init__(self, firebase_service: FirebaseService | None = None):
        self.firebase_service = firebase_service or FirebaseService()

    def get_current_user(self, authorization: str | None = Header(default=None)):
        """
        Validate the Bearer token and return the decoded Firebase user.
        """
        if not authorization:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Authorization header is missing.",
            )

        parts = authorization.strip().split(" ", 1)
        if len(parts) != 2 or parts[0].lower() != "bearer" or not parts[1].strip():
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authorization header format.",
            )

        token = parts[1].strip()

        try:
            decoded_token = self.firebase_service.verify_token(token)
        except FirebaseServiceError as exc:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=str(exc),
            ) from exc

        if decoded_token is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired Firebase token.",
            )

        return decoded_token

    def get_current_admin(self, user=Depends(get_current_user)):
        """
        Temporary admin check.

        Later, this can be replaced with a database role lookup.
        """
        is_admin = user.get("admin", False) or user.get("role") == "admin"

        if not is_admin:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Admin access required.",
            )

        return user


auth_dependencies = AuthDependencies()
