from .base import AdminServiceBase

class ProjectsManagement(AdminServiceBase):
    def get_all_projects(self, limit=50, offset=0, search_title=None):
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
                SELECT id, title, short_description, full_description, tech_stack, 
                       github_url, live_url, image_url, status, current_lead, 
                       former_leads, contributors, featured, display_order, updated_at
                FROM projects
                {where_clause}
                ORDER BY featured DESC, display_order ASC, updated_at DESC
                LIMIT %s OFFSET %s
                """,
                (*values, limit, offset),
            )
            items = cursor.fetchall() or []
            return self._success_response(data={"items": items, "count": len(items)}, items=items)
        except Exception as exc:
            return self._error_response(f"Error retrieving projects: {exc}")
        finally:
            self._close_cursor(cursor)
            self._close_db()

    def create_project(self, data: dict):
        cursor = None
        try:
            title = str(data.get("title") or "").strip()
            if len(title) < 3:
                return self._error_response("title must be at least 3 characters")

            cursor = self.db.get_cursor()
            
            fields = ["title", "short_description", "full_description", "tech_stack", 
                      "github_url", "live_url", "image_url", "status", "current_lead", 
                      "former_leads", "contributors", "featured", "display_order"]
            
            placeholders = ", ".join(["%s"] * len(fields))
            field_names = ", ".join(fields)
            values = [data.get(f) for f in fields]
            
            # Ensure proper defaults for BOOLEAN and INT
            values[fields.index("featured")] = bool(data.get("featured", False))
            values[fields.index("display_order")] = int(data.get("display_order", 0))

            cursor.execute(
                f"INSERT INTO projects ({field_names}) VALUES ({placeholders})",
                tuple(values)
            )
            self.db.commit()
            return self._success_response(message="Project created successfully", id=cursor.lastrowid)
        except Exception as exc:
            self.db.rollback()
            return self._error_response(f"Error creating project: {exc}")
        finally:
            self._close_cursor(cursor)
            self._close_db()

    def update_project(self, project_id: int, data: dict):
        cursor = None
        try:
            cursor = self.db.get_cursor()
            
            update_fields = []
            values = []
            
            filterable_fields = ["title", "short_description", "full_description", "tech_stack", 
                                 "github_url", "live_url", "image_url", "status", "current_lead", 
                                 "former_leads", "contributors", "featured", "display_order"]
            
            for field in filterable_fields:
                if field in data:
                    update_fields.append(f"{field} = %s")
                    val = data[field]
                    if field == "featured": val = bool(val)
                    if field == "display_order": val = int(val)
                    values.append(val)
            
            if not update_fields:
                return self._error_response("No fields to update")

            values.append(project_id)
            cursor.execute(
                f"UPDATE projects SET {', '.join(update_fields)} WHERE id = %s",
                tuple(values)
            )
            self.db.commit()
            return self._success_response(message="Project updated successfully")
        except Exception as exc:
            self.db.rollback()
            return self._error_response(f"Error updating project: {exc}")
        finally:
            self._close_cursor(cursor)
            self._close_db()

    def delete_project(self, project_id: int):
        cursor = None
        try:
            cursor = self.db.get_cursor()
            cursor.execute("DELETE FROM projects WHERE id = %s", (project_id,))
            self.db.commit()
            return self._success_response(message="Project deleted successfully")
        except Exception as exc:
            self.db.rollback()
            return self._error_response(f"Error deleting project: {exc}")
        finally:
            self._close_cursor(cursor)
            self._close_db()
