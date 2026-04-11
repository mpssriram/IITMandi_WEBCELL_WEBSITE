from fastapi import HTTPException, status

<<<<<<< Updated upstream
=======
<<<<<<< HEAD
from ..Database import Database
from ..admin.Event_Registration import EventRegistration
from ..admin.ResourceManagement import ResourceManagement
from ..admin.Teammanagement import TeamManagement
from ..auth import auth_dependencies


class UserService:
=======
>>>>>>> Stashed changes
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

<<<<<<< Updated upstream
=======
>>>>>>> 2f2962dab9d3219bb71e3a0d704e4ebffc7295f2
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
=======
<<<<<<< HEAD
            if not payload.email and not payload.roll_number:
                raise HTTPException(status_code=400, detail="Email or roll number is required.")

            cursor = self.db.get_cursor()
            cursor.execute(
                """
                SELECT id FROM users
                WHERE (email = %s AND %s IS NOT NULL) OR (roll_number = %s AND %s IS NOT NULL)
=======
>>>>>>> Stashed changes
            cursor = self.db.get_cursor()
            cursor.execute(
                """
                SELECT id
                FROM users
                WHERE (email = %s AND %s IS NOT NULL)
                   OR (roll_number = %s AND %s IS NOT NULL)
<<<<<<< Updated upstream
=======
>>>>>>> 2f2962dab9d3219bb71e3a0d704e4ebffc7295f2
>>>>>>> Stashed changes
                """,
                (payload.email, payload.email, payload.roll_number, payload.roll_number),
            )
            if cursor.fetchone():
<<<<<<< Updated upstream
=======
<<<<<<< HEAD
                raise HTTPException(status_code=409, detail="User with this email or roll number already exists.")

=======
>>>>>>> Stashed changes
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="User with this email or roll number already exists.",
                )

            hashed_password = auth_dependencies.hash_password(payload.password)
<<<<<<< Updated upstream
=======
>>>>>>> 2f2962dab9d3219bb71e3a0d704e4ebffc7295f2
>>>>>>> Stashed changes
            cursor.execute(
                """
                INSERT INTO users (name, email, roll_number, password, role)
                VALUES (%s, %s, %s, %s, %s)
                """,
<<<<<<< Updated upstream
=======
<<<<<<< HEAD
                (
                    payload.name,
                    payload.email,
                    payload.roll_number,
                    auth_dependencies.hash_password(payload.password),
                    "user",
                ),
            )
            self.db.commit()
            user_id = cursor.lastrowid
            cursor.execute(
                """
                SELECT id, name, email, roll_number, role, created_at, updated_at
                FROM users WHERE id = %s
=======
>>>>>>> Stashed changes
                (payload.name, payload.email, payload.roll_number, hashed_password, "user"),
            )
            self.db.commit()
            user_id = cursor.lastrowid

            cursor.execute(
                """
                SELECT id, name, email, roll_number, role, created_at, updated_at
                FROM users
                WHERE id = %s
<<<<<<< Updated upstream
=======
>>>>>>> 2f2962dab9d3219bb71e3a0d704e4ebffc7295f2
>>>>>>> Stashed changes
                """,
                (user_id,),
            )
            user = cursor.fetchone()
<<<<<<< Updated upstream
            token = auth_dependencies.create_local_access_token(user_id, user["role"])

=======
<<<<<<< HEAD
=======
            token = auth_dependencies.create_local_access_token(user_id, user["role"])

>>>>>>> 2f2962dab9d3219bb71e3a0d704e4ebffc7295f2
>>>>>>> Stashed changes
            return {
                "success": True,
                "message": "User registered successfully",
                "user": user,
<<<<<<< Updated upstream
                "access_token": token,
=======
<<<<<<< HEAD
                "access_token": auth_dependencies.create_local_access_token(user_id, user["role"]),
=======
                "access_token": token,
>>>>>>> 2f2962dab9d3219bb71e3a0d704e4ebffc7295f2
>>>>>>> Stashed changes
                "token_type": "bearer",
            }
        except HTTPException:
            self.db.rollback()
            raise
        except Exception as exc:
            self.db.rollback()
<<<<<<< Updated upstream
=======
<<<<<<< HEAD
            raise HTTPException(status_code=500, detail=f"Failed to register user: {exc}") from exc
=======
>>>>>>> Stashed changes
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to register user: {exc}",
            ) from exc
<<<<<<< Updated upstream
=======
>>>>>>> 2f2962dab9d3219bb71e3a0d704e4ebffc7295f2
>>>>>>> Stashed changes
        finally:
            self._close_cursor(cursor)
            self._close_db()

<<<<<<< Updated upstream
    def get_profile(self, current_user):
        return current_user

=======
<<<<<<< HEAD
=======
    def get_profile(self, current_user):
        return current_user

>>>>>>> 2f2962dab9d3219bb71e3a0d704e4ebffc7295f2
>>>>>>> Stashed changes
    def login_user(self, payload):
        cursor = None
        try:
            cursor = self.db.get_cursor()
            cursor.execute(
                """
                SELECT id, name, email, roll_number, password, role, created_at, updated_at
<<<<<<< Updated upstream
                FROM users
                WHERE email = %s OR roll_number = %s
=======
<<<<<<< HEAD
                FROM users WHERE email = %s OR roll_number = %s
=======
                FROM users
                WHERE email = %s OR roll_number = %s
>>>>>>> 2f2962dab9d3219bb71e3a0d704e4ebffc7295f2
>>>>>>> Stashed changes
                """,
                (payload.identifier, payload.identifier),
            )
            user = cursor.fetchone()
<<<<<<< Updated upstream
=======
<<<<<<< HEAD
            if not user or not auth_dependencies.verify_password(payload.password, user["password"]):
                raise HTTPException(status_code=401, detail="Invalid credentials.")

            safe_user = dict(user)
            safe_user.pop("password", None)
=======
>>>>>>> Stashed changes

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

<<<<<<< Updated upstream
=======
>>>>>>> 2f2962dab9d3219bb71e3a0d704e4ebffc7295f2
>>>>>>> Stashed changes
            return {
                "success": True,
                "message": "Login successful",
                "user": safe_user,
<<<<<<< Updated upstream
                "access_token": token,
=======
<<<<<<< HEAD
                "access_token": auth_dependencies.create_local_access_token(safe_user["id"], safe_user["role"]),
=======
                "access_token": token,
>>>>>>> 2f2962dab9d3219bb71e3a0d704e4ebffc7295f2
>>>>>>> Stashed changes
                "token_type": "bearer",
            }
        except HTTPException:
            raise
        except Exception as exc:
<<<<<<< Updated upstream
=======
<<<<<<< HEAD
            raise HTTPException(status_code=500, detail=f"Failed to login user: {exc}") from exc
=======
>>>>>>> Stashed changes
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to login user: {exc}",
            ) from exc
<<<<<<< Updated upstream
=======
>>>>>>> 2f2962dab9d3219bb71e3a0d704e4ebffc7295f2
>>>>>>> Stashed changes
        finally:
            self._close_cursor(cursor)
            self._close_db()

<<<<<<< Updated upstream
=======
<<<<<<< HEAD
    def get_profile(self, current_user):
        return current_user

    def update_profile(self, user_id, payload):
        cursor = None
        try:
            updates = payload.model_dump(exclude_unset=True)
            if not updates:
                raise HTTPException(status_code=400, detail="No valid fields to update.")

            cursor = self.db.get_cursor()
            for field in ("email", "roll_number"):
                value = updates.get(field)
                if value:
                    cursor.execute(f"SELECT id FROM users WHERE {field} = %s AND id != %s", (value, user_id))
                    if cursor.fetchone():
                        raise HTTPException(status_code=409, detail=f"{field.replace('_', ' ').title()} is already in use.")

            fields = [f"{field} = %s" for field in ("name", "email", "roll_number") if field in updates]
            values = [updates[field] for field in ("name", "email", "roll_number") if field in updates] + [user_id]
            cursor.execute(f"UPDATE users SET {', '.join(fields)} WHERE id = %s", tuple(values))
            self.db.commit()
            cursor.execute(
                "SELECT id, name, email, roll_number, role, created_at, updated_at FROM users WHERE id = %s",
=======
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
=======
>>>>>>> 2f2962dab9d3219bb71e3a0d704e4ebffc7295f2
>>>>>>> Stashed changes
                (user_id,),
            )
            return cursor.fetchone()
        except HTTPException:
            self.db.rollback()
            raise
        except Exception as exc:
            self.db.rollback()
<<<<<<< Updated upstream
=======
<<<<<<< HEAD
            raise HTTPException(status_code=500, detail=f"Failed to update profile: {exc}") from exc
=======
>>>>>>> Stashed changes
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to update profile: {exc}",
            ) from exc
<<<<<<< Updated upstream
=======
>>>>>>> 2f2962dab9d3219bb71e3a0d704e4ebffc7295f2
>>>>>>> Stashed changes
        finally:
            self._close_cursor(cursor)
            self._close_db()

<<<<<<< Updated upstream
=======
<<<<<<< HEAD
    def list_events(self, **filters):
        result = EventRegistration().get_all_events(**filters)
        if not result.get("success"):
            raise HTTPException(status_code=500, detail=result.get("error", "Failed to fetch events."))
        return result["data"]

    def get_event(self, event_id):
        result = EventRegistration().get_event_by_id(event_id)
        if not result.get("success"):
            raise HTTPException(status_code=404, detail=result.get("error", "Event not found."))
        return result["data"]

    def register_for_event(self, event_id, current_user):
        cursor = None
        try:
            self.get_event(event_id)
            cursor = self.db.get_cursor()
            user_uid = f"local:{current_user['id']}"
            cursor.execute(
                "SELECT id FROM event_registrations WHERE event_id = %s AND user_uid = %s",
                (event_id, user_uid),
            )
            if cursor.fetchone():
                raise HTTPException(status_code=409, detail="You are already registered for this event.")

            cursor.execute(
                """
                INSERT INTO event_registrations (event_id, user_uid, user_id, user_name, user_email, user_roll_number)
=======
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
=======
>>>>>>> 2f2962dab9d3219bb71e3a0d704e4ebffc7295f2
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
=======
<<<<<<< HEAD
            return {"success": True, "message": "Event registration successful", "event_id": event_id, "user_id": current_user["id"]}
=======
>>>>>>> Stashed changes
            return {
                "success": True,
                "message": "Event registration successful",
                "event_id": event_id,
                "user_id": current_user["id"],
            }
<<<<<<< Updated upstream
=======
>>>>>>> 2f2962dab9d3219bb71e3a0d704e4ebffc7295f2
>>>>>>> Stashed changes
        except HTTPException:
            self.db.rollback()
            raise
        except Exception as exc:
            self.db.rollback()
<<<<<<< Updated upstream
=======
<<<<<<< HEAD
            raise HTTPException(status_code=500, detail=f"Failed to register for event: {exc}") from exc
=======
>>>>>>> Stashed changes
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to register for event: {exc}",
            ) from exc
<<<<<<< Updated upstream
=======
>>>>>>> 2f2962dab9d3219bb71e3a0d704e4ebffc7295f2
>>>>>>> Stashed changes
        finally:
            self._close_cursor(cursor)
            self._close_db()

<<<<<<< Updated upstream
=======
<<<<<<< HEAD
    def list_resources(self, **filters):
        result = ResourceManagement().get_all_resources(**filters)
        if not result.get("success"):
            raise HTTPException(status_code=500, detail=result.get("error", "Failed to fetch resources."))
        return result["data"]

    def get_resource(self, resource_id):
        result = ResourceManagement().get_resource_by_id(resource_id)
        if not result.get("success"):
            raise HTTPException(status_code=404, detail=result.get("error", "Resource not found."))
        return result["data"]

    def list_announcements(self, limit=20, offset=0):
        data = self.list_resources(limit=limit, offset=offset)
        items = data.get("items", [])
        filtered = [item for item in items if str(item.get("type", "")).lower() in {"news", "announcement", "article"}]
        return {"items": filtered, "limit": limit, "offset": offset, "count": len(filtered)}

    def list_members(self, limit=50, offset=0):
        result = TeamManagement().get_all_team_members(limit=limit, offset=offset)
        if not result.get("success"):
            raise HTTPException(status_code=500, detail=result.get("error", "Failed to fetch members."))
        return result["data"]

    def list_projects(self, mine=False, user_id=None):
        cursor = None
        try:
            cursor = self.db.get_cursor()
            if mine and user_id:
                cursor.execute(
                    """
                    SELECT id, user_id, title, description, github_link, tech_stack, created_at, updated_at
                    FROM projects WHERE user_id = %s ORDER BY updated_at DESC, id DESC
                    """,
                    (user_id,),
                )
            else:
                cursor.execute(
                    """
                    SELECT id, user_id, title, description, github_link, tech_stack, created_at, updated_at
                    FROM projects ORDER BY updated_at DESC, id DESC
                    """
                )
            return {"items": cursor.fetchall(), "count": cursor.rowcount}
        except Exception as exc:
            raise HTTPException(status_code=500, detail=f"Failed to fetch projects: {exc}") from exc
        finally:
            self._close_cursor(cursor)
            self._close_db()

    def create_project(self, user_id, payload):
        cursor = None
        try:
            cursor = self.db.get_cursor()
            cursor.execute(
                """
                INSERT INTO projects (user_id, title, description, github_link, tech_stack)
                VALUES (%s, %s, %s, %s, %s)
                """,
                (user_id, payload.title, payload.description, payload.github_link, payload.tech_stack),
            )
            self.db.commit()
            return {"success": True, "message": "Project created successfully", "project_id": cursor.lastrowid}
        except Exception as exc:
            self.db.rollback()
            raise HTTPException(status_code=500, detail=f"Failed to create project: {exc}") from exc
        finally:
            self._close_cursor(cursor)
            self._close_db()

    def update_project(self, project_id, user_id, payload):
        cursor = None
        try:
            cursor = self.db.get_cursor()
            cursor.execute("SELECT id FROM projects WHERE id = %s AND user_id = %s", (project_id, user_id))
            if not cursor.fetchone():
                raise HTTPException(status_code=404, detail="Project not found.")
            cursor.execute(
                """
                UPDATE projects SET title = %s, description = %s, github_link = %s, tech_stack = %s
                WHERE id = %s AND user_id = %s
                """,
                (payload.title, payload.description, payload.github_link, payload.tech_stack, project_id, user_id),
            )
            self.db.commit()
            return {"success": True, "message": "Project updated successfully", "project_id": project_id}
        except HTTPException:
            self.db.rollback()
            raise
        except Exception as exc:
            self.db.rollback()
            raise HTTPException(status_code=500, detail=f"Failed to update project: {exc}") from exc
        finally:
            self._close_cursor(cursor)
            self._close_db()

    def delete_project(self, project_id, user_id):
        cursor = None
        try:
            cursor = self.db.get_cursor()
            cursor.execute("DELETE FROM projects WHERE id = %s AND user_id = %s", (project_id, user_id))
            self.db.commit()
            if cursor.rowcount <= 0:
                raise HTTPException(status_code=404, detail="Project not found.")
            return {"success": True, "message": "Project deleted successfully", "project_id": project_id}
        except HTTPException:
            self.db.rollback()
            raise
        except Exception as exc:
            self.db.rollback()
            raise HTTPException(status_code=500, detail=f"Failed to delete project: {exc}") from exc
        finally:
            self._close_cursor(cursor)
            self._close_db()

    def list_notifications(self, user_id):
        cursor = None
        try:
            cursor = self.db.get_cursor()
            cursor.execute(
                """
                SELECT id, user_id, title, message, type, is_read, created_at
                FROM notifications
                WHERE user_id = %s OR user_id IS NULL
                ORDER BY created_at DESC, id DESC
                """,
                (user_id,),
            )
            rows = cursor.fetchall()
            return {"items": rows, "count": len(rows)}
        except Exception as exc:
            raise HTTPException(status_code=500, detail=f"Failed to fetch notifications: {exc}") from exc
        finally:
            self._close_cursor(cursor)
            self._close_db()
=======
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
=======
>>>>>>> 2f2962dab9d3219bb71e3a0d704e4ebffc7295f2
>>>>>>> Stashed changes
