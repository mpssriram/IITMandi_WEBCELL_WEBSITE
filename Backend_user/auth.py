import logging

from fastapi import Header, HTTPException, status

from Backend.auth import AuthDependencies as SharedAuthDependencies
from .Database import Database, DatabaseError


class AuthDependencies(SharedAuthDependencies):
    """Firebase auth dependencies with admin-role checks."""

    def __init__(self):
        super().__init__()
        self.logger = logging.getLogger(__name__)

    def get_current_user(self, authorization: str | None = Header(default=None)):
        firebase_user = super().get_current_user(authorization)
        self.logger.debug(
            "Resolved Firebase user from token",
            extra={"uid": firebase_user.get("uid"), "email": firebase_user.get("email")},
        )

        try:
            db = Database()
            local_user = db.resolve_firebase_user(firebase_user, create_if_missing=False)
            new_user = False

            if not local_user:
                self.logger.info(
                    "No local user mapping found; auto-provisioning",
                    extra={"uid": firebase_user.get("uid"), "email": firebase_user.get("email")},
                )
                local_user = Database().resolve_firebase_user(firebase_user, create_if_missing=True)
                new_user = True

            if local_user:
                self.logger.info(
                    "Local user mapped",
                    extra={"user_id": local_user.get("id"), "uid": local_user.get("firebase_uid")},
                )
        except DatabaseError as exc:
            self.logger.exception("Local user lookup/provision failed")
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Unable to resolve local user profile at this time.",
            ) from exc

        if not local_user:
            self.logger.warning("Local user mapping returned empty result")
            pending_user = dict(firebase_user)
            pending_user["new_user"] = True
            pending_user["onboarding_required"] = True
            pending_user["admin"] = self.is_admin_user(pending_user)
            pending_user["role"] = "admin" if pending_user["admin"] else str(pending_user.get("role") or "user")
            return pending_user

        merged_user = dict(firebase_user)
        merged_user.update(local_user)
        merged_user["new_user"] = new_user
        merged_user["onboarding_required"] = not bool(local_user.get("roll_number"))
        merged_user["admin"] = self.is_admin_user(merged_user)
        if merged_user["admin"]:
            merged_user["role"] = "admin"
        return merged_user

    def get_current_admin(self, authorization: str | None = Header(default=None)):
        user = self.get_current_user(authorization)
        is_admin = self.is_admin_user(user)

        if not is_admin:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Admin access required.",
            )

        return user


auth_dependencies = AuthDependencies()

__all__ = ["AuthDependencies", "auth_dependencies"]
