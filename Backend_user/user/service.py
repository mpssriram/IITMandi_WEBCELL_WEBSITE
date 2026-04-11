from fastapi import HTTPException, status

try:
    from ..Database import Database
    from ..admin.Event_Registration import EventRegistration
    from ..admin.ResourceManagement import ResourceManagement
    from ..admin.Teammanagement import TeamManagement
    from ..auth import auth_dependencies
except ImportError:
    from Database import Database
    from admin.Event_Registration import EventRegistration
    from admin.ResourceManagement import ResourceManagement
    from admin.Teammanagement import TeamManagement
    from auth import auth_dependencies


class UserService:
    """
    User-facing service layer for local auth, profiles, events, and content.
    """

    def __init__(self):
        self.db = Database()

    def _close_cursor(self, cursor):
        if cursor:
            cursor.close()

    def _close_db(self):
        try:
            self.db.close()
        except Exception:
            pass

    def register_user(self, payload):
        cursor = None
        try:
            cursor = self.db.get_cursor()
            cursor.execute(
                """
                SELECT id
                FROM users
                WHERE (email = %s AND %s IS NOT NULL)
                   OR (roll_number = %s AND %s IS NOT NULL)
                """,
                (payload.email, payload.email, payload.roll_number, payload.roll_number),
            )
            if cursor.fetchone():
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="User with this email or roll number already exists.",
                )

            hashed_password = auth_dependencies.hash_password(payload.password)
            cursor.execute(
                """
                INSERT INTO users (name, email, roll_number, password, role)
                VALUES (%s, %s, %s, %s, %s)
                """,
                (payload.name, payload.email, payload.roll_number, hashed_password, "user"),
            )
            self.db.commit()
            user_id = cursor.lastrowid

            cursor.execute(
                """
                SELECT id, name, email, roll_number, role, created_at, updated_at
                FROM users
                WHERE id = %s
                """,
                (user_id,),
            )
            user = cursor.fetchone()
            token = auth_dependencies.create_local_access_token(user_id, user["role"])

            return {
                "success": True,
                "message": "User registered successfully",
                "user": user,
                "access_token": token,
                "token_type": "bearer",
            }
        except HTTPException:
            self.db.rollback()
            raise
        except Exception as exc:
            self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to register user: {exc}",
            ) from exc
        finally:
            self._close_cursor(cursor)
            self._close_db()

    def get_profile(self, current_user):
        return current_user

    def login_user(self, payload):
        cursor = None
        try:
            cursor = self.db.get_cursor()
            cursor.execute(
                """
                SELECT id, name, email, roll_number, password, role, created_at, updated_at
                FROM users
                WHERE email = %s OR roll_number = %s
                """,
                (payload.identifier, payload.identifier),
            )
            user = cursor.fetchone()

            if not user or not auth_dependencies.verify_password(
                payload.password, user["password"]
            ):
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid credentials.",
                )

            safe_user = dict(user)
            safe_user.pop("password", None)
            token = auth_dependencies.create_local_access_token(
                safe_user["id"], safe_user["role"]
            )

            return {
                "success": True,
                "message": "Login successful",
                "user": safe_user,
                "access_token": token,
                "token_type": "bearer",
            }
        except HTTPException:
            raise
        except Exception as exc:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to login user: {exc}",
            ) from exc
        finally:
            self._close_cursor(cursor)
            self._close_db()

    def update_profile(self, user_id, payload):
        cursor = None
        try:
            update_data = payload.model_dump(exclude_unset=True)
            cursor = self.db.get_cursor()

            if "email" in update_data and update_data["email"]:
                cursor.execute(
                    "SELECT id FROM users WHERE email = %s AND id != %s",
                    (update_data["email"], user_id),
                )
                if cursor.fetchone():
                    raise HTTPException(
                        status_code=status.HTTP_409_CONFLICT,
                        detail="Email is already in use.",
                    )

            if "roll_number" in update_data and update_data["roll_number"]:
                cursor.execute(
                    "SELECT id FROM users WHERE roll_number = %s AND id != %s",
                    (update_data["roll_number"], user_id),
                )
                if cursor.fetchone():
                    raise HTTPException(
                        status_code=status.HTTP_409_CONFLICT,
                        detail="Roll number is already in use.",
                    )

            fields = []
            values = []
            for field in ["name", "email", "roll_number"]:
                if field in update_data:
                    fields.append(f"{field} = %s")
                    values.append(update_data[field])

            if not fields:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="No valid fields to update.",
                )

            values.append(user_id)
            cursor.execute(
                f"UPDATE users SET {', '.join(fields)} WHERE id = %s",
                tuple(values),
            )
            self.db.commit()
            cursor.execute(
                """
                SELECT id, name, email, roll_number, role, created_at, updated_at
                FROM users
                WHERE id = %s
                """,
                (user_id,),
            )
            return cursor.fetchone()
        except HTTPException:
            self.db.rollback()
            raise
        except Exception as exc:
            self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to update profile: {exc}",
            ) from exc
        finally:
            self._close_cursor(cursor)
            self._close_db()

    def register_for_event(self, event_id, current_user):
        cursor = None
        try:
            event_admin = EventRegistration()
            event_result = event_admin.get_event_by_id(event_id)
            if not event_result.get("success"):
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=event_result.get("error", "Event not found."),
                )

            cursor = self.db.get_cursor()
            user_uid = f"local:{current_user['id']}"
            cursor.execute(
                """
                SELECT id
                FROM event_registrations
                WHERE event_id = %s AND user_uid = %s
                """,
                (event_id, user_uid),
            )
            if cursor.fetchone():
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="You are already registered for this event.",
                )

            cursor.execute(
                """
                INSERT INTO event_registrations (
                    event_id, user_uid, user_id, user_name, user_email, user_roll_number
                )
                VALUES (%s, %s, %s, %s, %s, %s)
                """,
                (
                    event_id,
                    user_uid,
                    current_user["id"],
                    current_user["name"],
                    current_user.get("email"),
                    current_user.get("roll_number"),
                ),
            )
            self.db.commit()
            return {
                "success": True,
                "message": "Event registration successful",
                "event_id": event_id,
                "user_id": current_user["id"],
            }
        except HTTPException:
            self.db.rollback()
            raise
        except Exception as exc:
            self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to register for event: {exc}",
            ) from exc
        finally:
            self._close_cursor(cursor)
            self._close_db()

    def list_public_events(self, **kwargs):
        event_admin = EventRegistration()
        result = event_admin.get_all_events(**kwargs)
        if not result.get("success"):
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=result.get("error", "Failed to fetch events."),
            )
        return result["data"]

    def get_public_event(self, event_id):
        event_admin = EventRegistration()
        result = event_admin.get_event_by_id(event_id)
        if not result.get("success"):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=result.get("error", "Event not found."),
            )
        return result["data"]

    def list_public_resources(self, **kwargs):
        resource_admin = ResourceManagement()
        result = resource_admin.get_all_resources(**kwargs)
        if not result.get("success"):
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=result.get("error", "Failed to fetch resources."),
            )
        return result["data"]

    def get_public_resource(self, resource_id):
        resource_admin = ResourceManagement()
        result = resource_admin.get_resource_by_id(resource_id)
        if not result.get("success"):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=result.get("error", "Resource not found."),
            )
        return result["data"]

    def list_public_members(self, limit=50, offset=0):
        team_admin = TeamManagement()
        result = team_admin.get_all_team_members(limit=limit, offset=offset)
        if not result.get("success"):
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=result.get("error", "Failed to fetch members."),
            )
        return result["data"]
