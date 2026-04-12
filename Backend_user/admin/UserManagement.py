from .base import AdminServiceBase


class UserManagement(AdminServiceBase):
    VALID_ROLES = {"user", "admin"}

    def _normalize_role(self, role_value):
        normalized = str(role_value or "user").strip().lower()
        if normalized not in self.VALID_ROLES:
            return None
        return normalized

    def get_users(self, limit=10, offset=0, search=None, role=None):
        is_valid, limit, offset, error = self._validate_limit_offset(limit, offset)
        if not is_valid:
            return self._error_response(error)

        normalized_role = None
        if role is not None:
            normalized_role = self._normalize_role(role)
            if not normalized_role:
                return self._error_response("role must be either user or admin")

        cursor = None
        try:
            cursor = self.db.get_cursor()
            conditions = []
            values = []

            if search:
                search_value = f"%{str(search).strip()}%"
                conditions.append("(name LIKE %s OR email LIKE %s OR roll_number LIKE %s)")
                values.extend([search_value, search_value, search_value])

            if normalized_role:
                conditions.append("LOWER(role) = %s")
                values.append(normalized_role)

            where_clause = f"WHERE {' AND '.join(conditions)}" if conditions else ""

            cursor.execute(
                f"""
                SELECT {self.db.USER_SELECT_FIELDS}
                FROM users
                {where_clause}
                ORDER BY created_at DESC, id DESC
                LIMIT %s OFFSET %s
                """,
                (*values, limit, offset),
            )
            items = cursor.fetchall() or []
            return self._success_response(data={"items": items, "count": len(items)}, items=items, count=len(items))
        except Exception as exc:
            return self._error_response(f"Error retrieving users: {exc}")
        finally:
            self._close_cursor(cursor)
            self._close_db()

    def create_user(self, user_data: dict):
        cursor = None
        try:
            name = str(user_data.get("name") or "").strip()
            email = str(user_data.get("email") or "").strip().lower()
            roll_number = str(user_data.get("roll_number") or "").strip() or None
            role = self._normalize_role(user_data.get("role"))

            if len(name) < 2:
                return self._error_response("name is required and must be at least 2 characters")
            if not email or "@" not in email:
                return self._error_response("valid email is required")
            if role is None:
                return self._error_response("role must be either user or admin")
            if roll_number and len(roll_number) < 4:
                return self._error_response("roll_number must be at least 4 characters when provided")

            cursor = self.db.get_cursor()

            cursor.execute("SELECT id FROM users WHERE email = %s", (email,))
            if cursor.fetchone():
                return self._error_response("A user with this email already exists")

            if roll_number:
                cursor.execute("SELECT id FROM users WHERE roll_number = %s", (roll_number,))
                if cursor.fetchone():
                    return self._error_response("A user with this roll number already exists")

            cursor.execute(
                """
                INSERT INTO users (firebase_uid, name, email, roll_number, password, role)
                VALUES (%s, %s, %s, %s, %s, %s)
                """,
                (None, name, email, roll_number, "admin_created_pending_firebase", role),
            )
            self.db.commit()

            cursor.execute(
                f"""
                SELECT {self.db.USER_SELECT_FIELDS}
                FROM users
                WHERE id = %s
                """,
                (cursor.lastrowid,),
            )
            created_user = cursor.fetchone()
            return self._success_response(
                data=created_user,
                message="User added successfully. Firebase will link on first sign-in.",
            )
        except Exception as exc:
            self.db.rollback()
            return self._error_response(f"Error creating user: {exc}")
        finally:
            self._close_cursor(cursor)
            self._close_db()
    def update_user(self, user_id: int, user_data: dict):
        cursor = None
        try:
            name = str(user_data.get("name") or "").strip()
            role = self._normalize_role(user_data.get("role"))
            roll_number = str(user_data.get("roll_number") or "").strip() or None

            if not name and not role and not roll_number:
                return self._error_response("No valid fields provided for update")

            cursor = self.db.get_cursor()
            
            # Verify user exists
            cursor.execute("SELECT id FROM users WHERE id = %s", (user_id,))
            if not cursor.fetchone():
                return self._error_response("User not found")

            update_parts = []
            values = []
            if name:
                update_parts.append("name = %s")
                values.append(name)
            if role:
                update_parts.append("role = %s")
                values.append(role)
            if roll_number:
                update_parts.append("roll_number = %s")
                values.append(roll_number)

            values.append(user_id)
            cursor.execute(f"UPDATE users SET {', '.join(update_parts)} WHERE id = %s", tuple(values))
            self.db.commit()

            return self._success_response(message="User updated successfully")
        except Exception as exc:
            self.db.rollback()
            return self._error_response(f"Error updating user: {exc}")
        finally:
            self._close_cursor(cursor)
            self._close_db()

    def toggle_user_status(self, user_id: int, active: bool):
        cursor = None
        try:
            cursor = self.db.get_cursor()
            cursor.execute("UPDATE users SET active = %s WHERE id = %s", (active, user_id))
            self.db.commit()

            if cursor.rowcount == 0:
                return self._error_response("User not found")

            status_text = "activated" if active else "deactivated"
            return self._success_response(message=f"User successfully {status_text}")
        except Exception as exc:
            self.db.rollback()
            return self._error_response(f"Error toggling user status: {exc}")
        finally:
            self._close_cursor(cursor)
            self._close_db()

    def delete_user(self, user_id: int):
        cursor = None
        try:
            cursor = self.db.get_cursor()
            cursor.execute("DELETE FROM users WHERE id = %s", (user_id,))
            self.db.commit()

            if cursor.rowcount == 0:
                return self._error_response("User not found")

            return self._success_response(message="User hard-deleted successfully")
        except Exception as exc:
            self.db.rollback()
            return self._error_response(f"Error deleting user: {exc}")
        finally:
            self._close_cursor(cursor)
            self._close_db()
