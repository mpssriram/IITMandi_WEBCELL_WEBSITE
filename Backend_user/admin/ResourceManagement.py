import os
import shutil

from .base import AdminServiceBase


class ResourceManagement(AdminServiceBase):
    ALLOWED_RESOURCE_TYPES = ["pdf", "article", "video", "link", "doc", "other"]

    def __init__(self):
        super().__init__()
        self.resources_dir = os.path.join(os.getcwd(), "resources")
        os.makedirs(self.resources_dir, exist_ok=True)

    def _is_pdf_type(self, resource_type):
        return str(resource_type).strip().lower() == "pdf"

    def _validate_resource_payload(self, resource_data, partial=False):
        if not isinstance(resource_data, dict):
            return self._error_response("Resource data must be a dictionary")

        cleaned = {}
        required = {"title", "type", "url"}
        for field in ["title", "description", "type", "url", "category", "uploaded_by"]:
            if field not in resource_data:
                continue

            value = resource_data[field]
            if isinstance(value, str):
                value = value.strip()
            if field in required and not partial and not value:
                return self._error_response(f"{field} is required")
            if field == "type" and value:
                value = value.lower()
                if value not in self.ALLOWED_RESOURCE_TYPES:
                    return self._error_response(
                        f"type must be one of: {', '.join(self.ALLOWED_RESOURCE_TYPES)}"
                    )
            if field in {"description", "category", "uploaded_by"} and value == "":
                value = None
            if field in required and partial and field in resource_data and value in ("", None):
                return self._error_response(f"{field} cannot be empty")
            if value is not None:
                cleaned[field] = value

        if not partial:
            missing = [field for field in required if not cleaned.get(field)]
            if missing:
                return self._error_response(f"Missing required fields: {', '.join(missing)}")
        elif not cleaned:
            return self._error_response("No valid fields to update")

        return self._success_response(data=cleaned)

    def _safe_copy_pdf(self, source_path, title):
        if not source_path or not os.path.isfile(source_path):
            return self._error_response("PDF file not found")

        filename = f"{str(title or 'resource').strip().replace(' ', '_')}_{os.path.basename(source_path)}"
        destination = os.path.join(self.resources_dir, filename)
        shutil.copy2(source_path, destination)
        return self._success_response(data={"path": destination})

    def _safe_delete_file(self, path):
        if not path:
            return True
        try:
            if os.path.isfile(path):
                os.remove(path)
            return True
        except OSError:
            return False

    def _is_local_resource_file(self, path):
        if not path:
            return False
        return os.path.abspath(path).startswith(os.path.abspath(self.resources_dir))

    def _fetch_resources(self, where_clause="", values=None, limit=10, offset=0):
        cursor = None
        try:
            cursor = self.db.get_cursor()
            cursor.execute(
                f"""
                SELECT id, title, description, type, url, category, uploaded_by, created_at
                FROM resources
                {where_clause}
                ORDER BY created_at DESC
                LIMIT %s OFFSET %s
                """,
                tuple([*(values or []), limit, offset]),
            )
            return cursor.fetchall()
        finally:
            self._close_cursor(cursor)
            self._close_db()

    def create_resource(self, resource_data):
        validation = self._validate_resource_payload(resource_data)
        if not validation["success"]:
            return validation

        copied_pdf_path = None
        cleaned = validation["data"]
        if self._is_pdf_type(cleaned["type"]):
            result = self._safe_copy_pdf(cleaned["url"], cleaned["title"])
            if not result["success"]:
                return result
            copied_pdf_path = result["data"]["path"]
            cleaned["url"] = copied_pdf_path

        cursor = None
        try:
            cursor = self.db.get_cursor()
            cursor.execute(
                """
                INSERT INTO resources (title, description, type, url, category, uploaded_by, created_at)
                VALUES (%s, %s, %s, %s, %s, %s, NOW())
                """,
                (
                    cleaned.get("title"),
                    cleaned.get("description"),
                    cleaned.get("type"),
                    cleaned.get("url"),
                    cleaned.get("category"),
                    cleaned.get("uploaded_by"),
                ),
            )
            self.db.commit()
            resource_id = cursor.lastrowid
            return self._success_response(
                data={"resource_id": resource_id},
                message="Resource created successfully",
                resource_id=resource_id,
            )
        except Exception as exc:
            self.db.rollback()
            if copied_pdf_path:
                self._safe_delete_file(copied_pdf_path)
            return self._error_response(f"Failed to create resource: {exc}")
        finally:
            self._close_cursor(cursor)
            self._close_db()

    def get_all_resources(
        self,
        limit=10,
        offset=0,
        search_title=None,
        search_category=None,
        search_uploaded_by=None,
        search_type=None,
    ):
        is_valid, limit, offset, error = self._validate_limit_offset(limit, offset)
        if not is_valid:
            return self._error_response(error)

        conditions, values = [], []
        normalized_type = None
        if search_type:
            normalized_type = str(search_type).strip().lower()
            if normalized_type not in self.ALLOWED_RESOURCE_TYPES:
                return self._error_response(
                    f"search_type must be one of: {', '.join(self.ALLOWED_RESOURCE_TYPES)}"
                )

        for clause, value in {
            "title LIKE %s": search_title,
            "category LIKE %s": search_category,
            "uploaded_by LIKE %s": search_uploaded_by,
        }.items():
            if value:
                conditions.append(clause)
                values.append(f"%{str(value).strip()}%")
        if normalized_type:
            conditions.append("type = %s")
            values.append(normalized_type)

        try:
            where_clause = f"WHERE {' AND '.join(conditions)}" if conditions else ""
            resources = self._fetch_resources(where_clause, values, limit, offset)
            return self._success_response(
                data={
                    "items": resources,
                    "limit": limit,
                    "offset": offset,
                    "count": len(resources),
                    "filters": {
                        "search_title": search_title,
                        "search_category": search_category,
                        "search_uploaded_by": search_uploaded_by,
                        "search_type": normalized_type,
                    },
                },
                resources=resources,
            )
        except Exception as exc:
            return self._error_response(f"Failed to retrieve resources: {exc}")

    def get_filtered_resources(
        self, limit=10, offset=0, search=None, resource_type=None, category=None, uploaded_by=None
    ):
        is_valid, limit, offset, error = self._validate_limit_offset(limit, offset)
        if not is_valid:
            return self._error_response(error)

        if resource_type is not None:
            resource_type = str(resource_type).strip().lower()
            if resource_type not in self.ALLOWED_RESOURCE_TYPES:
                return self._error_response(
                    f"resource_type must be one of: {', '.join(self.ALLOWED_RESOURCE_TYPES)}"
                )

        conditions, values = [], []
        if search:
            search_value = f"%{str(search).strip()}%"
            conditions.append(
                "(title LIKE %s OR description LIKE %s OR category LIKE %s OR uploaded_by LIKE %s)"
            )
            values.extend([search_value] * 4)
        for clause, value in {
            "type = %s": resource_type,
            "category = %s": category,
            "uploaded_by = %s": uploaded_by,
        }.items():
            if value:
                conditions.append(clause)
                values.append(str(value).strip())

        try:
            where_clause = f"WHERE {' AND '.join(conditions)}" if conditions else ""
            resources = self._fetch_resources(where_clause, values, limit, offset)
            return self._success_response(
                data={
                    "items": resources,
                    "limit": limit,
                    "offset": offset,
                    "count": len(resources),
                    "filters": {
                        "search": search,
                        "resource_type": resource_type,
                        "category": category,
                        "uploaded_by": uploaded_by,
                    },
                },
                resources=resources,
            )
        except Exception as exc:
            return self._error_response(f"Failed to retrieve filtered resources: {exc}")

    def get_resource_by_id(self, resource_id):
        cursor = None
        try:
            cursor = self.db.get_cursor()
            cursor.execute(
                """
                SELECT id, title, description, type, url, category, uploaded_by, created_at
                FROM resources
                WHERE id = %s
                """,
                (resource_id,),
            )
            resource = cursor.fetchone()
            if not resource:
                return self._error_response("Resource not found")
            return self._success_response(data=resource, resource=resource)
        except Exception as exc:
            return self._error_response(f"Failed to retrieve resource: {exc}")
        finally:
            self._close_cursor(cursor)
            self._close_db()

    def update_resource(self, resource_id, resource_data):
        validation = self._validate_resource_payload(resource_data, partial=True)
        if not validation["success"]:
            return validation

        cleaned = validation["data"]
        cursor = None
        new_pdf_path = old_pdf_path = None
        try:
            cursor = self.db.get_cursor()
            cursor.execute(
                "SELECT id, title, description, type, url, category, uploaded_by FROM resources WHERE id = %s",
                (resource_id,),
            )
            existing = cursor.fetchone()
            if not existing:
                return self._error_response("Resource not found")

            updated = dict(existing)
            updated.update(cleaned)
            if self._is_pdf_type(updated.get("type")):
                incoming_url = cleaned.get("url")
                if incoming_url:
                    result = self._safe_copy_pdf(incoming_url, cleaned.get("title", updated.get("title")))
                    if not result["success"]:
                        return result
                    new_pdf_path = result["data"]["path"]
                    updated["url"] = new_pdf_path
                    old_pdf_path = existing.get("url")
                elif not existing.get("url"):
                    return self._error_response("PDF resources require a valid file path")
            elif "url" in cleaned and not cleaned.get("url"):
                return self._error_response("url cannot be empty")

            fields = ["title", "description", "type", "url", "category", "uploaded_by"]
            values = [updated.get(field) for field in fields] + [resource_id]
            cursor.execute(
                f"UPDATE resources SET {', '.join(f'{field} = %s' for field in fields)} WHERE id = %s",
                tuple(values),
            )
            self.db.commit()

            if new_pdf_path and old_pdf_path and old_pdf_path != new_pdf_path and self._is_local_resource_file(old_pdf_path):
                self._safe_delete_file(old_pdf_path)
            return self._success_response(message="Resource updated successfully")
        except Exception as exc:
            self.db.rollback()
            if new_pdf_path:
                self._safe_delete_file(new_pdf_path)
            return self._error_response(f"Failed to update resource: {exc}")
        finally:
            self._close_cursor(cursor)
            self._close_db()

    def delete_resource(self, resource_id):
        cursor = None
        try:
            cursor = self.db.get_cursor()
            cursor.execute("SELECT id, type, url FROM resources WHERE id = %s", (resource_id,))
            resource = cursor.fetchone()
            if not resource:
                return self._error_response("Resource not found")

            cursor.execute("DELETE FROM resources WHERE id = %s", (resource_id,))
            self.db.commit()

            warning = None
            if (
                self._is_pdf_type(resource.get("type"))
                and resource.get("url")
                and self._is_local_resource_file(resource.get("url"))
                and not self._safe_delete_file(resource.get("url"))
            ):
                warning = "Resource deleted, but local file could not be removed"

            return self._success_response(
                data={"resource_id": resource_id},
                message=warning or "Resource deleted successfully",
            )
        except Exception as exc:
            self.db.rollback()
            return self._error_response(f"Failed to delete resource: {exc}")
        finally:
            self._close_cursor(cursor)
            self._close_db()

    def get_resource_stats(self):
        cursor = None
        try:
            cursor = self.db.get_cursor()
            cursor.execute("SELECT COUNT(*) AS total_resources FROM resources")
            total_resources = int((cursor.fetchone() or {}).get("total_resources") or 0)
            cursor.execute("SELECT type, COUNT(*) AS count FROM resources GROUP BY type ORDER BY count DESC, type ASC")
            by_type = cursor.fetchall()
            cursor.execute(
                "SELECT category, COUNT(*) AS count FROM resources GROUP BY category ORDER BY count DESC, category ASC"
            )
            by_category = cursor.fetchall()
            return self._success_response(
                data={
                    "total_resources": total_resources,
                    "breakdown_by_type": by_type,
                    "breakdown_by_category": by_category,
                }
            )
        except Exception as exc:
            return self._error_response(f"Failed to get resource stats: {exc}")
        finally:
            self._close_cursor(cursor)
            self._close_db()
