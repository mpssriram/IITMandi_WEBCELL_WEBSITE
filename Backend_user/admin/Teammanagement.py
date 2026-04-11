from ..Database import Database


class TeamManagament:
    ROLE_ORDER = ["Head", "Co-Head", "Admin", "Co-Admin", "Core Team", "Member"]

    def __init__(self):
        """Set up the team management service with the shared database helper."""
        self.db = Database()

    def _success_response(self, data=None, message=None, **extra):
        """Build a standard success response used by this file."""
        response = {"success": True}
        if message:
            response["message"] = message
        if data is not None:
            response["data"] = data
        response.update(extra)
        return response

    def _error_response(self, error, message=None, **extra):
        """Build a standard error response used by this file."""
        response = {"success": False, "error": error}
        if message:
            response["message"] = message
        response.update(extra)
        return response

    def _close_cursor(self, cursor):
        """Close a cursor safely after finishing a query."""
        if cursor:
            cursor.close()

    def _close_db(self):
        """Close the database connection safely after each method call."""
        try:
            self.db.close()
        except Exception:
            pass

    def _validate_limit_offset(self, limit, offset):
        """Validate pagination values and convert them to integers."""
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

    def _normalize_role(self, role):
        """Normalize role input into one of the allowed stored role values."""
        if role is None:
            return None

        role_text = str(role).strip().lower()
        role_map = {
            "head": "Head",
            "co-head": "Co-Head",
            "co head": "Co-Head",
            "admin": "Admin",
            "co-admin": "Co-Admin",
            "co admin": "Co-Admin",
            "core team": "Core Team",
            "member": "Member",
        }
        return role_map.get(role_text)

    def _role_order_sql(self):
        """Return the SQL CASE block used for consistent role-based ordering."""
        return """
            CASE
                WHEN role = 'Head' THEN 1
                WHEN role = 'Co-Head' THEN 2
                WHEN role = 'Admin' THEN 3
                WHEN role = 'Co-Admin' THEN 4
                WHEN role = 'Core Team' THEN 5
                WHEN role = 'Member' THEN 6
                ELSE 7
            END
        """

    def _validate_member_payload(self, member_details, partial=False):
        """Validate team member data for create or update requests."""
        if not isinstance(member_details, dict):
            return self._error_response("Member details must be a dictionary")

        cleaned_data = {}
        required_fields = ["name", "roll_no", "role"]

        for field in ["name", "roll_no", "url", "role"]:
            if field not in member_details:
                continue

            value = member_details.get(field)
            if isinstance(value, str):
                value = value.strip()

            if field in required_fields and not partial and not value:
                return self._error_response(f"{field} is required")

            if field == "role" and value:
                normalized_role = self._normalize_role(value)
                if not normalized_role:
                    return self._error_response(
                        f"role must be one of: {', '.join(self.ROLE_ORDER)}"
                    )
                value = normalized_role

            if field == "url" and value == "":
                value = None

            if value is not None:
                cleaned_data[field] = value
            elif partial and field in member_details and field in required_fields:
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

    def create_member(self, member_details):
        """Create a team member after validating fields and roll number uniqueness."""
        cursor = None

        validation = self._validate_member_payload(member_details, partial=False)
        if not validation["success"]:
            return validation

        cleaned_data = validation["data"]

        try:
            cursor = self.db.get_cursor()
            cursor.execute("SELECT id FROM Team WHERE roll_no = %s", (cleaned_data["roll_no"],))
            if cursor.fetchone():
                return self._error_response("A team member with this roll_no already exists")

            sql = """
            INSERT INTO Team (
                name, roll_no, url, role
            ) VALUES (%s, %s, %s, %s)
            """
            cursor.execute(
                sql,
                (
                    cleaned_data.get("name"),
                    cleaned_data.get("roll_no"),
                    cleaned_data.get("url"),
                    cleaned_data.get("role"),
                ),
            )
            self.db.commit()
            member_id = cursor.lastrowid
            return self._success_response(
                data={"member_id": member_id},
                message="Team member added successfully",
                member_id=member_id,
            )
        except Exception as e:
            self.db.rollback()
            return self._error_response(f"Error creating team member: {str(e)}")
        finally:
            self._close_cursor(cursor)
            self._close_db()

    def get_all_team_members(
        self,
        limit=10,
        offset=0,
        search_name=None,
        search_roll_no=None,
        search_role=None,
    ):
        """Return paginated team members with optional name, roll number, and role filters."""
        cursor = None

        is_valid, limit, offset, error = self._validate_limit_offset(limit, offset)
        if not is_valid:
            return self._error_response(error)

        normalized_role = None
        if search_role:
            normalized_role = self._normalize_role(search_role)
            if not normalized_role:
                return self._error_response(
                    f"search_role must be one of: {', '.join(self.ROLE_ORDER)}"
                )

        try:
            cursor = self.db.get_cursor()
            conditions = []
            values = []

            if search_name:
                conditions.append("name LIKE %s")
                values.append(f"%{str(search_name).strip()}%")

            if search_roll_no:
                conditions.append("roll_no LIKE %s")
                values.append(f"%{str(search_roll_no).strip()}%")

            if normalized_role:
                conditions.append("role = %s")
                values.append(normalized_role)

            where_clause = ""
            if conditions:
                where_clause = "WHERE " + " AND ".join(conditions)

            sql = f"""
            SELECT id, name, roll_no, url, role
            FROM Team
            {where_clause}
            ORDER BY {self._role_order_sql()}, name ASC
            LIMIT %s OFFSET %s
            """
            values.extend([limit, offset])
            cursor.execute(sql, tuple(values))
            team_members = cursor.fetchall()
            return self._success_response(
                data={
                    "items": team_members,
                    "limit": limit,
                    "offset": offset,
                    "count": len(team_members),
                    "filters": {
                        "search_name": search_name,
                        "search_roll_no": search_roll_no,
                        "search_role": normalized_role,
                    },
                },
                team_members=team_members,
            )
        except Exception as e:
            return self._error_response(f"Error retrieving team members: {str(e)}")
        finally:
            self._close_cursor(cursor)
            self._close_db()

    def get_filtered_team_members(self, limit=10, offset=0, search=None, role=None):
        """Return paginated team members filtered by search text and role."""
        cursor = None

        is_valid, limit, offset, error = self._validate_limit_offset(limit, offset)
        if not is_valid:
            return self._error_response(error)

        normalized_role = None
        if role is not None:
            normalized_role = self._normalize_role(role)
            if not normalized_role:
                return self._error_response(
                    f"role must be one of: {', '.join(self.ROLE_ORDER)}"
                )

        try:
            cursor = self.db.get_cursor()
            conditions = []
            values = []

            if search:
                search_value = f"%{str(search).strip()}%"
                conditions.append("(name LIKE %s OR roll_no LIKE %s)")
                values.extend([search_value, search_value])

            if normalized_role:
                conditions.append("role = %s")
                values.append(normalized_role)

            where_clause = ""
            if conditions:
                where_clause = "WHERE " + " AND ".join(conditions)

            sql = f"""
            SELECT id, name, roll_no, url, role
            FROM Team
            {where_clause}
            ORDER BY {self._role_order_sql()}, name ASC
            LIMIT %s OFFSET %s
            """
            values.extend([limit, offset])
            cursor.execute(sql, tuple(values))
            team_members = cursor.fetchall()

            return self._success_response(
                data={
                    "items": team_members,
                    "limit": limit,
                    "offset": offset,
                    "count": len(team_members),
                    "filters": {"search": search, "role": normalized_role},
                },
                team_members=team_members,
            )
        except Exception as e:
            return self._error_response(f"Error retrieving filtered team members: {str(e)}")
        finally:
            self._close_cursor(cursor)
            self._close_db()

    def get_team_members_grouped_by_role(self):
        """Group team members by role using the same role order as the main listing."""
        all_members_result = self.get_all_team_members(limit=1000, offset=0)
        if not all_members_result["success"]:
            return all_members_result

        grouped_members = {}
        for role in self.ROLE_ORDER:
            grouped_members[role] = []

        for member in all_members_result["data"]["items"]:
            role = member.get("role") or "Member"
            if role not in grouped_members:
                grouped_members[role] = []
            grouped_members[role].append(member)

        return self._success_response(data=grouped_members, grouped_members=grouped_members)

    def get_team_stats(self):
        """Return total team members and the role breakdown."""
        cursor = None

        try:
            cursor = self.db.get_cursor()
            cursor.execute("SELECT COUNT(*) AS total_members FROM Team")
            total_members = int((cursor.fetchone() or {}).get("total_members") or 0)

            cursor.execute(
                """
                SELECT role, COUNT(*) AS count
                FROM Team
                GROUP BY role
                ORDER BY
                    CASE
                        WHEN role = 'Head' THEN 1
                        WHEN role = 'Co-Head' THEN 2
                        WHEN role = 'Admin' THEN 3
                        WHEN role = 'Co-Admin' THEN 4
                        WHEN role = 'Core Team' THEN 5
                        WHEN role = 'Member' THEN 6
                        ELSE 7
                    END,
                    role ASC
                """
            )
            role_breakdown = cursor.fetchall()

            return self._success_response(
                data={
                    "total_members": total_members,
                    "role_breakdown": role_breakdown,
                }
            )
        except Exception as e:
            return self._error_response(f"Error retrieving team stats: {str(e)}")
        finally:
            self._close_cursor(cursor)
            self._close_db()

    def update_team_member(self, member_id, member_details):
        """Update a team member after validating fields and duplicate roll number rules."""
        cursor = None

        validation = self._validate_member_payload(member_details, partial=True)
        if not validation["success"]:
            return validation

        cleaned_data = validation["data"]

        try:
            cursor = self.db.get_cursor()
            cursor.execute("SELECT * FROM Team WHERE id = %s", (member_id,))
            existing_member = cursor.fetchone()

            if not existing_member:
                return self._error_response("Team member not found")

            if "roll_no" in cleaned_data:
                cursor.execute(
                    "SELECT id FROM Team WHERE roll_no = %s AND id != %s",
                    (cleaned_data["roll_no"], member_id),
                )
                if cursor.fetchone():
                    return self._error_response(
                        "Another team member with this roll_no already exists"
                    )

            update_fields = []
            values = []
            for field, value in cleaned_data.items():
                update_fields.append(f"{field} = %s")
                values.append(value)

            sql = f"UPDATE Team SET {', '.join(update_fields)} WHERE id = %s"
            values.append(member_id)
            cursor.execute(sql, tuple(values))
            self.db.commit()

            return self._success_response(message="Team member updated successfully")
        except Exception as e:
            self.db.rollback()
            return self._error_response(f"Error updating team member: {str(e)}")
        finally:
            self._close_cursor(cursor)
            self._close_db()

    def get_team_member(self, member_id):
        """Fetch one team member by id."""
        cursor = None

        try:
            cursor = self.db.get_cursor()
            cursor.execute("SELECT * FROM Team WHERE id = %s", (member_id,))
            team_member = cursor.fetchone()

            if not team_member:
                return self._error_response("Team member not found")

            return self._success_response(data=team_member, team_member=team_member)
        except Exception as e:
            return self._error_response(f"Error retrieving team member {member_id}: {str(e)}")
        finally:
            self._close_cursor(cursor)
            self._close_db()

    def delete_team_member(self, member_id):
        """Delete a team member by id."""
        cursor = None

        try:
            cursor = self.db.get_cursor()
            cursor.execute("DELETE FROM Team WHERE id = %s", (member_id,))
            self.db.commit()

            if cursor.rowcount <= 0:
                return self._error_response("Team member not found")

            return self._success_response(
                data={"member_id": member_id},
                message="Team member deleted successfully",
            )
        except Exception as e:
            self.db.rollback()
            return self._error_response(f"Error deleting team member: {str(e)}")
        finally:
            self._close_cursor(cursor)
            self._close_db()

    def Search_member(self, name):
        """Backward-compatible search helper that reuses the filtered team member search."""
        return self.get_filtered_team_members(search=name)


class TeamManagement(TeamManagament):
    """Backward-compatible alias with the corrected class name."""
    pass


if __name__ == "__main__":
    pass
