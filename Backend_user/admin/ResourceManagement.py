import os
import shutil

from ..Database import Database


class ResourceManagement:
    """
    Admin-only digital resource management system.
    Handles creating, retrieving, updating, and deleting resources.
    """

    ALLOWED_RESOURCE_TYPES = ["pdf", "article", "video", "link", "doc", "other"]

    def __init__(self):
        # Set up the resource manager and ensure the local resource folder exists
        self.db = Database()
        self.resources_dir = os.path.join(os.getcwd(), "resources")
        os.makedirs(self.resources_dir, exist_ok=True)

    def _success_response(self, data=None, message=None, **extra):
        # Builds a standard success response used by this file
        response = {"success": True}
        if message:
            response["message"] = message
        if data is not None:
            response["data"] = data
        response.update(extra)
        return response

    def _error_response(self, error, message=None, **extra):
        # Builds a standard error response used by this file
        response = {"success": False, "error": error}
        if message:
            response["message"] = message
        response.update(extra)
        return response

    def _close_cursor(self, cursor):
        #  Helps in close a cursor safely after finishing a query
        if cursor:
            cursor.close()

    def _close_db(self):
        #  Closes the database connection safely after each method call 
        try:
            self.db.close()
        except Exception:
            pass

    def _validate_limit_offset(self, limit, offset):
        #  It verifies the  pagination values and convert them to integers
        try:
            limit = int(limit)
            offset = int(offset)
        except (TypeError, ValueError):
            return False, None, None, "Limit and offset must be integers"

        if limit <= 0:
            return False, None, None, "Limit must be greater than 0"
        if offset < 0:
            return False, None, None, "Offset cannot be negative"

        return True, limit, offset, None

    def _is_pdf_type(self, resource_type):
        """Check whether the resource should be treated as a PDF upload."""
        return str(resource_type).strip().lower() == "pdf"

    def _validate_resource_payload(self, resource_data, partial=False):
        """Validate resource data for create or update requests."""
        if not isinstance(resource_data, dict):
            return self._error_response("Resource data must be a dictionary")

        cleaned_data = {}
        required_fields = ["title", "type", "url"]

        for field in ["title", "description", "type", "url", "category", "uploaded_by"]:
            if field not in resource_data:
                continue

            value = resource_data.get(field)
            if isinstance(value, str):
                value = value.strip()

            if field in required_fields and not partial and not value:
                return self._error_response(f"{field} is required")

            if field == "type" and value:
                value = value.lower()
                if value not in self.ALLOWED_RESOURCE_TYPES:
                    return self._error_response(
                        f"type must be one of: {', '.join(self.ALLOWED_RESOURCE_TYPES)}"
                    )

            if field in ["description", "category", "uploaded_by"] and value == "":
                value = None

            if value is not None:
                cleaned_data[field] = value
            elif partial and field in resource_data and field in required_fields:
                return self._error_response(f"{field} cannot be empty")

        if not partial:
            missing_fields = [field for field in required_fields if not cleaned_data.get(field)]
            if missing_fields:
                return self._error_response(
                    f"Missing required fields: {', '.join(missing_fields)}"
                )

        if partial and not cleaned_data:
            return self._error_response("No valid fields to update")

        return self._success_response(data=cleaned_data)

    def _safe_copy_pdf(self, source_path, title):
        """Copy a PDF into local storage and return the new stored path."""
        if not source_path or not os.path.isfile(source_path):
            return self._error_response("PDF file not found")

        safe_title = str(title or "resource").strip().replace(" ", "_")
        file_name = f"{safe_title}_{os.path.basename(source_path)}"
        dest_path = os.path.join(self.resources_dir, file_name)
        shutil.copy2(source_path, dest_path)
        return self._success_response(data={"path": dest_path})

    def _safe_delete_file(self, path):
        """Delete a local file safely without raising file-system errors."""
        if not path:
            return True
        try:
            if os.path.isfile(path):
                os.remove(path)
            return True
        except OSError:
            return False

    def _is_local_resource_file(self, path):
        """Check whether a file path points inside the local resources folder."""
        if not path:
            return False
        abs_path = os.path.abspath(path)
        resources_root = os.path.abspath(self.resources_dir)
        return abs_path.startswith(resources_root)

    def create_resource(self, resource_data):
        """Create a new resource and copy PDF files into local storage when needed."""
        cursor = None
        copied_pdf_path = None

        validation = self._validate_resource_payload(resource_data, partial=False)
        if not validation["success"]:
            return validation

        cleaned_data = validation["data"]

        if self._is_pdf_type(cleaned_data["type"]):
            copy_result = self._safe_copy_pdf(cleaned_data["url"], cleaned_data["title"])
            if not copy_result["success"]:
                return copy_result
            copied_pdf_path = copy_result["data"]["path"]
            cleaned_data["url"] = copied_pdf_path

        try:
            cursor = self.db.get_cursor()
            sql = """
            INSERT INTO resources (
                title, description, type, url, category, uploaded_by, created_at
            ) VALUES (%s, %s, %s, %s, %s, %s, NOW())
            """
            cursor.execute(
                sql,
                (
                    cleaned_data.get("title"),
                    cleaned_data.get("description"),
                    cleaned_data.get("type"),
                    cleaned_data.get("url"),
                    cleaned_data.get("category"),
                    cleaned_data.get("uploaded_by"),
                ),
            )
            self.db.commit()
            resource_id = cursor.lastrowid
            return self._success_response(
                data={"resource_id": resource_id},
                message="Resource created successfully",
                resource_id=resource_id,
            )
        except Exception as e:
            self.db.rollback()
            if copied_pdf_path:
                self._safe_delete_file(copied_pdf_path)
            return self._error_response(f"Failed to create resource: {str(e)}")
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
        """Return paginated resources with optional title, category, uploader, and type filters."""
        cursor = None

        is_valid, limit, offset, error = self._validate_limit_offset(limit, offset)
        if not is_valid:
            return self._error_response(error)

        normalized_type = None
        if search_type:
            normalized_type = str(search_type).strip().lower()
            if normalized_type not in self.ALLOWED_RESOURCE_TYPES:
                return self._error_response(
                    f"search_type must be one of: {', '.join(self.ALLOWED_RESOURCE_TYPES)}"
                )

        try:
            cursor = self.db.get_cursor()
            conditions = []
            values = []

            if search_title:
                conditions.append("title LIKE %s")
                values.append(f"%{str(search_title).strip()}%")

            if search_category:
                conditions.append("category LIKE %s")
                values.append(f"%{str(search_category).strip()}%")

            if search_uploaded_by:
                conditions.append("uploaded_by LIKE %s")
                values.append(f"%{str(search_uploaded_by).strip()}%")

            if normalized_type:
                conditions.append("type = %s")
                values.append(normalized_type)

            where_clause = ""
            if conditions:
                where_clause = "WHERE " + " AND ".join(conditions)

            sql = f"""
            SELECT id, title, description, type, url, category, uploaded_by, created_at
            FROM resources
            {where_clause}
            ORDER BY created_at DESC
            LIMIT %s OFFSET %s
            """
            values.extend([limit, offset])
            cursor.execute(sql, tuple(values))
            resources = cursor.fetchall()
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
                items=resources,
                count=len(resources),
                resources=resources,
            )
        except Exception as e:
            return self._error_response(f"Failed to retrieve resources: {str(e)}")
        finally:
            self._close_cursor(cursor)
            self._close_db()

    def get_filtered_resources(
        self,
        limit=10,
        offset=0,
        search=None,
        resource_type=None,
        category=None,
        uploaded_by=None,
    ):
        """Return paginated resources filtered by search text and metadata fields."""
        cursor = None

        is_valid, limit, offset, error = self._validate_limit_offset(limit, offset)
        if not is_valid:
            return self._error_response(error)

        if resource_type is not None:
            resource_type = str(resource_type).strip().lower()
            if resource_type not in self.ALLOWED_RESOURCE_TYPES:
                return self._error_response(
                    f"resource_type must be one of: {', '.join(self.ALLOWED_RESOURCE_TYPES)}"
                )

        try:
            cursor = self.db.get_cursor()
            conditions = []
            values = []

            if search:
                search_value = f"%{str(search).strip()}%"
                conditions.append(
                    "(title LIKE %s OR description LIKE %s OR category LIKE %s OR uploaded_by LIKE %s)"
                )
                values.extend([search_value, search_value, search_value, search_value])

            if resource_type:
                conditions.append("type = %s")
                values.append(resource_type)

            if category:
                conditions.append("category = %s")
                values.append(str(category).strip())

            if uploaded_by:
                conditions.append("uploaded_by = %s")
                values.append(str(uploaded_by).strip())

            where_clause = ""
            if conditions:
                where_clause = "WHERE " + " AND ".join(conditions)

            sql = f"""
            SELECT id, title, description, type, url, category, uploaded_by, created_at
            FROM resources
            {where_clause}
            ORDER BY created_at DESC
            LIMIT %s OFFSET %s
            """
            values.extend([limit, offset])
            cursor.execute(sql, tuple(values))
            resources = cursor.fetchall()

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
        except Exception as e:
            return self._error_response(f"Failed to retrieve filtered resources: {str(e)}")
        finally:
            self._close_cursor(cursor)
            self._close_db()

    def get_resource_by_id(self, resource_id):
        """Fetch one resource by id."""
        cursor = None

        try:
            cursor = self.db.get_cursor()
            sql = """
            SELECT id, title, description, type, url, category, uploaded_by, created_at
            FROM resources
            WHERE id = %s
            """
            cursor.execute(sql, (resource_id,))
            resource = cursor.fetchone()
            if not resource:
                return self._error_response("Resource not found")
            return self._success_response(data=resource, resource=resource)
        except Exception as e:
            return self._error_response(f"Failed to retrieve resource: {str(e)}")
        finally:
            self._close_cursor(cursor)
            self._close_db()

    def update_resource(self, resource_id, resource_data):
        """Update a resource and safely replace stored PDF files when required."""
        cursor = None
        new_pdf_path = None
        old_pdf_path = None

        validation = self._validate_resource_payload(resource_data, partial=True)
        if not validation["success"]:
            return validation

        cleaned_data = validation["data"]

        try:
            cursor = self.db.get_cursor()
            cursor.execute(
                """
                SELECT id, title, description, type, url, category, uploaded_by
                FROM resources
                WHERE id = %s
                """,
                (resource_id,),
            )
            existing_resource = cursor.fetchone()

            if not existing_resource:
                return self._error_response("Resource not found")

            updated_resource = dict(existing_resource)
            updated_resource.update(cleaned_data)

            if self._is_pdf_type(updated_resource.get("type")):
                incoming_url = cleaned_data.get("url")
                if incoming_url:
                    copy_result = self._safe_copy_pdf(
                        incoming_url,
                        cleaned_data.get("title", updated_resource.get("title")),
                    )
                    if not copy_result["success"]:
                        return copy_result
                    new_pdf_path = copy_result["data"]["path"]
                    updated_resource["url"] = new_pdf_path
                    old_pdf_path = existing_resource.get("url")
                elif not existing_resource.get("url"):
                    return self._error_response("PDF resources require a valid file path")
            elif "url" in cleaned_data and not cleaned_data.get("url"):
                return self._error_response("url cannot be empty")

            update_fields = []
            values = []
            for field in ["title", "description", "type", "url", "category", "uploaded_by"]:
                if field in updated_resource:
                    update_fields.append(f"{field} = %s")
                    values.append(updated_resource.get(field))

            sql = f"UPDATE resources SET {', '.join(update_fields)} WHERE id = %s"
            values.append(resource_id)
            cursor.execute(sql, tuple(values))
            self.db.commit()

            if (
                new_pdf_path
                and old_pdf_path
                and old_pdf_path != new_pdf_path
                and self._is_local_resource_file(old_pdf_path)
            ):
                self._safe_delete_file(old_pdf_path)

            return self._success_response(message="Resource updated successfully")
        except Exception as e:
            self.db.rollback()
            if new_pdf_path:
                self._safe_delete_file(new_pdf_path)
            return self._error_response(f"Failed to update resource: {str(e)}")
        finally:
            self._close_cursor(cursor)
            self._close_db()

    def delete_resource(self, resource_id):
        """Delete a resource and clean up its stored local PDF file when possible."""
        cursor = None

        try:
            cursor = self.db.get_cursor()
            cursor.execute(
                """
                SELECT id, type, url
                FROM resources
                WHERE id = %s
                """,
                (resource_id,),
            )
            resource = cursor.fetchone()

            if not resource:
                return self._error_response("Resource not found")

            cursor.execute("DELETE FROM resources WHERE id = %s", (resource_id,))
            self.db.commit()

            file_delete_warning = None
            if (
                self._is_pdf_type(resource.get("type"))
                and resource.get("url")
                and self._is_local_resource_file(resource.get("url"))
            ):
                if not self._safe_delete_file(resource.get("url")):
                    file_delete_warning = "Resource deleted, but local file could not be removed"

            return self._success_response(
                data={"resource_id": resource_id},
                message=file_delete_warning or "Resource deleted successfully",
            )
        except Exception as e:
            self.db.rollback()
            return self._error_response(f"Failed to delete resource: {str(e)}")
        finally:
            self._close_cursor(cursor)
            self._close_db()

    def get_resource_stats(self):
        """Return resource totals with breakdowns by type and category."""
        cursor = None

        try:
            cursor = self.db.get_cursor()
            cursor.execute("SELECT COUNT(*) AS total_resources FROM resources")
            total_resources = int((cursor.fetchone() or {}).get("total_resources") or 0)

            cursor.execute(
                """
                SELECT type, COUNT(*) AS count
                FROM resources
                GROUP BY type
                ORDER BY count DESC, type ASC
                """
            )
            type_breakdown = cursor.fetchall()

            cursor.execute(
                """
                SELECT category, COUNT(*) AS count
                FROM resources
                GROUP BY category
                ORDER BY count DESC, category ASC
                """
            )
            category_breakdown = cursor.fetchall()

            stats = {
                "total_resources": total_resources,
                "breakdown_by_type": type_breakdown,
                "breakdown_by_category": category_breakdown,
            }
            return self._success_response(data=stats)
        except Exception as e:
            return self._error_response(f"Failed to get resource stats: {str(e)}")
        finally:
            self._close_cursor(cursor)
            self._close_db()


if __name__ == "__main__":
    rm = ResourceManagement()
    print(rm.get_all_resources())
