from .base import AdminServiceBase

class AnnouncementsManagement(AdminServiceBase):
    def get_all_announcements(self, limit=50, offset=0, search_title=None):
        is_valid, limit, offset, error = self._validate_limit_offset(limit, offset)
        if not is_valid:
            return self._error_response(error)

        cursor = None
        try:
            cursor = self.db.get_cursor()
            conditions = []
            values = []

            if search_title:
                conditions.append("title LIKE %s")
                values.append(f"%{str(search_title).strip()}%")

            where_clause = f"WHERE {' AND '.join(conditions)}" if conditions else ""

            cursor.execute(
                f"""
                SELECT id, title, content, category, date, is_pinned, created_at
                FROM announcements
                {where_clause}
                ORDER BY is_pinned DESC, date DESC, id DESC
                LIMIT %s OFFSET %s
                """,
                (*values, limit, offset),
            )
            items = cursor.fetchall() or []
            return self._success_response(data={"items": items, "count": len(items)}, items=items)
        except Exception as exc:
            return self._error_response(f"Error retrieving announcements: {exc}")
        finally:
            self._close_cursor(cursor)
            self._close_db()

    def create_announcement(self, data: dict):
        cursor = None
        try:
            title = str(data.get("title") or "").strip()
            content = str(data.get("content") or "").strip()
            date = str(data.get("date") or "").strip()
            category = str(data.get("category") or "General").strip()
            is_pinned = bool(data.get("is_pinned", False))

            if len(title) < 3:
                return self._error_response("title must be at least 3 characters")
            if not content:
                return self._error_response("content is required")
            if not date:
                return self._error_response("date is required")

            cursor = self.db.get_cursor()
            cursor.execute(
                """
                INSERT INTO announcements (title, content, category, date, is_pinned)
                VALUES (%s, %s, %s, %s, %s)
                """,
                (title, content, category, date, is_pinned),
            )
            self.db.commit()
            return self._success_response(message="Announcement created successfully", id=cursor.lastrowid)
        except Exception as exc:
            self.db.rollback()
            return self._error_response(f"Error creating announcement: {exc}")
        finally:
            self._close_cursor(cursor)
            self._close_db()

    def update_announcement(self, announcement_id: int, data: dict):
        cursor = None
        try:
            cursor = self.db.get_cursor()
            
            update_fields = []
            values = []
            
            for field in ["title", "content", "category", "date", "is_pinned"]:
                if field in data:
                    update_fields.append(f"{field} = %s")
                    values.append(data[field])
            
            if not update_fields:
                return self._error_response("No fields to update")

            values.append(announcement_id)
            cursor.execute(
                f"UPDATE announcements SET {', '.join(update_fields)} WHERE id = %s",
                tuple(values)
            )
            self.db.commit()
            return self._success_response(message="Announcement updated successfully")
        except Exception as exc:
            self.db.rollback()
            return self._error_response(f"Error updating announcement: {exc}")
        finally:
            self._close_cursor(cursor)
            self._close_db()

    def delete_announcement(self, announcement_id: int):
        cursor = None
        try:
            cursor = self.db.get_cursor()
            cursor.execute("DELETE FROM announcements WHERE id = %s", (announcement_id,))
            self.db.commit()
            return self._success_response(message="Announcement deleted successfully")
        except Exception as exc:
            self.db.rollback()
            return self._error_response(f"Error deleting announcement: {exc}")
        finally:
            self._close_cursor(cursor)
            self._close_db()
