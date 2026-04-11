from datetime import datetime, timedelta, timezone
import os

import bcrypt
import jwt
from fastapi import Header, HTTPException, status

from Backend.auth import AuthDependencies as SharedAuthDependencies
<<<<<<< Updated upstream
=======
<<<<<<< HEAD

from .Database import Database
from .config import Config


class AuthDependencies(SharedAuthDependencies):
=======
>>>>>>> Stashed changes
from Backend_user.Database import Database
from Backend_user.config import Config


class AuthDependencies(SharedAuthDependencies):
    """
    Extend the shared backend auth helpers with local JWT user auth.
    """

<<<<<<< Updated upstream
=======
>>>>>>> 2f2962dab9d3219bb71e3a0d704e4ebffc7295f2
>>>>>>> Stashed changes
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.config = Config()
        self.jwt_secret = self.config._get("auth.jwt_secret", os.getenv("JWT_SECRET", "change_me"))
        self.jwt_algorithm = self.config._get("auth.jwt_algorithm", os.getenv("JWT_ALGORITHM", "HS256"))
        self.jwt_expires_minutes = int(
<<<<<<< Updated upstream
=======
<<<<<<< HEAD
            self.config._get("auth.jwt_expires_in_minutes", os.getenv("JWT_EXPIRES_IN_MINUTES", "10080"))
        )

    def get_current_admin(self, authorization: str | None = Header(default=None)):
        user = self.get_current_user(authorization)
        if not (user.get("admin", False) or user.get("role") == "admin"):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required.")
        return user

    def hash_password(self, password: str) -> str:
        return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))

    def create_local_access_token(self, user_id: int, role: str = "user") -> str:
=======
>>>>>>> Stashed changes
            self.config._get(
                "auth.jwt_expires_in_minutes",
                os.getenv("JWT_EXPIRES_IN_MINUTES", "10080"),
            )
        )

    def get_current_admin(self, authorization: str | None = Header(default=None)):
        """
        Keep the admin dependency compatible with FastAPI by resolving the user
        from the shared Firebase auth helper and then checking admin access.
        """
        user = self.get_current_user(authorization)
        is_admin = user.get("admin", False) or user.get("role") == "admin"

        if not is_admin:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Admin access required.",
            )

        return user

    def hash_password(self, password: str) -> str:
        """
        Hash a plain password for local user accounts.
        """
        return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        """
        Compare a plain password against the stored bcrypt hash.
        """
        return bcrypt.checkpw(
            plain_password.encode("utf-8"), hashed_password.encode("utf-8")
        )

    def create_local_access_token(self, user_id: int, role: str = "user") -> str:
        """
        Create a JWT token for local user authentication.
        """
<<<<<<< Updated upstream
=======
>>>>>>> 2f2962dab9d3219bb71e3a0d704e4ebffc7295f2
>>>>>>> Stashed changes
        payload = {
            "sub": str(user_id),
            "role": role,
            "scope": "local_user",
<<<<<<< Updated upstream
            "exp": datetime.now(timezone.utc)
            + timedelta(minutes=self.jwt_expires_minutes),
=======
<<<<<<< HEAD
            "exp": datetime.now(timezone.utc) + timedelta(minutes=self.jwt_expires_minutes),
=======
            "exp": datetime.now(timezone.utc)
            + timedelta(minutes=self.jwt_expires_minutes),
>>>>>>> 2f2962dab9d3219bb71e3a0d704e4ebffc7295f2
>>>>>>> Stashed changes
        }
        return jwt.encode(payload, self.jwt_secret, algorithm=self.jwt_algorithm)

    def decode_local_access_token(self, token: str) -> dict:
<<<<<<< Updated upstream
=======
<<<<<<< HEAD
        return jwt.decode(token, self.jwt_secret, algorithms=[self.jwt_algorithm])

    def get_current_local_user(self, authorization: str | None = Header(default=None)):
        if not authorization:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authorization header is missing.")

        parts = authorization.strip().split(" ", 1)
        if len(parts) != 2 or parts[0].lower() != "bearer" or not parts[1].strip():
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid authorization header format.")

        try:
            decoded = self.decode_local_access_token(parts[1].strip())
        except jwt.PyJWTError as exc:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired JWT token.") from exc

        if decoded.get("scope") != "local_user" or not decoded.get("sub"):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token.")
=======
>>>>>>> Stashed changes
        """
        Decode a JWT token created for local user authentication.
        """
        return jwt.decode(token, self.jwt_secret, algorithms=[self.jwt_algorithm])

    def get_current_local_user(self, authorization: str | None = Header(default=None)):
        """
        Validate a local JWT token and load the matching user from MySQL.
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
            decoded_token = self.decode_local_access_token(token)
        except jwt.PyJWTError as exc:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired JWT token.",
            ) from exc

        if decoded_token.get("scope") != "local_user":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token scope.",
            )

        user_id = decoded_token.get("sub")
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token is missing user information.",
            )
<<<<<<< Updated upstream
=======
>>>>>>> 2f2962dab9d3219bb71e3a0d704e4ebffc7295f2
>>>>>>> Stashed changes

        db = Database(config=self.config)
        cursor = None
        try:
            cursor = db.get_cursor()
            cursor.execute(
                """
                SELECT id, name, email, roll_number, role, created_at, updated_at
                FROM users
                WHERE id = %s
                """,
<<<<<<< Updated upstream
=======
<<<<<<< HEAD
                (int(decoded["sub"]),),
            )
            user = cursor.fetchone()
        except Exception as exc:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to load user: {exc}") from exc
=======
>>>>>>> Stashed changes
                (int(user_id),),
            )
            user = cursor.fetchone()
        except Exception as exc:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to load user: {exc}",
            ) from exc
<<<<<<< Updated upstream
=======
>>>>>>> 2f2962dab9d3219bb71e3a0d704e4ebffc7295f2
>>>>>>> Stashed changes
        finally:
            if cursor:
                cursor.close()
            db.close()

        if not user:
<<<<<<< Updated upstream
=======
<<<<<<< HEAD
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found for this token.")
=======
>>>>>>> Stashed changes
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found for this token.",
            )

<<<<<<< Updated upstream
=======
>>>>>>> 2f2962dab9d3219bb71e3a0d704e4ebffc7295f2
>>>>>>> Stashed changes
        return user


auth_dependencies = AuthDependencies()

__all__ = ["AuthDependencies", "auth_dependencies"]
