from .base import AdminServiceBase


class TeamManagament(AdminServiceBase):
    ROLE_ORDER = ["Head", "Co-Head", "Admin", "Co-Admin", "Core Team", "Member"]
    ROLE_ORDER_SQL = """
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

    def _normalize_role(self, role):
        if role is None:
            return None
        return {
            "head": "Head",
            "co-head": "Co-Head",
            "co head": "Co-Head",
            "admin": "Admin",
            "co-admin": "Co-Admin",
            "co admin": "Co-Admin",
            "core team": "Core Team",
            "member": "Member",
        }.get(str(role).strip().lower())

    def _validate_member_payload(self, member_details, partial=False):
        if not isinstance(member_details, dict):
            return self._error_response("Member details must be a dictionary")

        cleaned = {}
        required = {"name", "roll_no", "role"}
        for field in ["name", "roll_no", "url", "role"]:
            if field not in member_details:
                continue

            value = member_details[field]
            if isinstance(value, str):
                value = value.strip()
            if field in required and not partial and not value:
                return self._error_response(f"{field} is required")
            if field == "role" and value:
                value = self._normalize_role(value)
                if not value:
                    return self._error_response(f"role must be one of: {', '.join(self.ROLE_ORDER)}")
            if field == "url" and value == "":
                value = None
            if field in required and partial and field in member_details and value in ("", None):
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

    def _fetch_team_members(self, where_clause="", values=None, limit=10, offset=0):
        cursor = None
        try:
            cursor = self.db.get_cursor()
            cursor.execute(
                f"""
                SELECT id, name, roll_no, url, role
                FROM Team
                {where_clause}
                ORDER BY {self.ROLE_ORDER_SQL}, name ASC
                LIMIT %s OFFSET %s
                """,
                tuple([*(values or []), limit, offset]),
            )
            return cursor.fetchall()
        finally:
            self._close_cursor(cursor)
            self._close_db()

    def create_member(self, member_details):
        validation = self._validate_member_payload(member_details)
        if not validation["success"]:
            return validation

        cursor = None
        try:
            cleaned = validation["data"]
            cursor = self.db.get_cursor()
            cursor.execute("SELECT id FROM Team WHERE roll_no = %s", (cleaned["roll_no"],))
            if cursor.fetchone():
                return self._error_response("A team member with this roll_no already exists")

            cursor.execute(
                "INSERT INTO Team (name, roll_no, url, role) VALUES (%s, %s, %s, %s)",
                (
                    cleaned.get("name"),
                    cleaned.get("roll_no"),
                    cleaned.get("url"),
                    cleaned.get("role"),
                ),
            )
            self.db.commit()
            member_id = cursor.lastrowid
            return self._success_response(
                data={"member_id": member_id},
                message="Team member added successfully",
                member_id=member_id,
            )
        except Exception as exc:
            self.db.rollback()
            return self._error_response(f"Error creating team member: {exc}")
        finally:
            self._close_cursor(cursor)
            self._close_db()

    def get_all_team_members(
        self, limit=10, offset=0, search_name=None, search_roll_no=None, search_role=None
    ):
        is_valid, limit, offset, error = self._validate_limit_offset(limit, offset)
        if not is_valid:
            return self._error_response(error)

        normalized_role = self._normalize_role(search_role) if search_role else None
        if search_role and not normalized_role:
            return self._error_response(f"search_role must be one of: {', '.join(self.ROLE_ORDER)}")

        conditions, values = [], []
        for clause, value in {
            "name LIKE %s": search_name,
            "roll_no LIKE %s": search_roll_no,
        }.items():
            if value:
                conditions.append(clause)
                values.append(f"%{str(value).strip()}%")
        if normalized_role:
            conditions.append("role = %s")
            values.append(normalized_role)

        try:
            where_clause = f"WHERE {' AND '.join(conditions)}" if conditions else ""
            members = self._fetch_team_members(where_clause, values, limit, offset)
            return self._success_response(
                data={
                    "items": members,
                    "limit": limit,
                    "offset": offset,
                    "count": len(members),
                    "filters": {
                        "search_name": search_name,
                        "search_roll_no": search_roll_no,
                        "search_role": normalized_role,
                    },
                },
                team_members=members,
            )
        except Exception as exc:
            return self._error_response(f"Error retrieving team members: {exc}")

    def get_filtered_team_members(self, limit=10, offset=0, search=None, role=None):
        is_valid, limit, offset, error = self._validate_limit_offset(limit, offset)
        if not is_valid:
            return self._error_response(error)

        normalized_role = self._normalize_role(role) if role is not None else None
        if role is not None and not normalized_role:
            return self._error_response(f"role must be one of: {', '.join(self.ROLE_ORDER)}")

        conditions, values = [], []
        if search:
            search_value = f"%{str(search).strip()}%"
            conditions.append("(name LIKE %s OR roll_no LIKE %s)")
            values.extend([search_value, search_value])
        if normalized_role:
            conditions.append("role = %s")
            values.append(normalized_role)

        try:
            where_clause = f"WHERE {' AND '.join(conditions)}" if conditions else ""
            members = self._fetch_team_members(where_clause, values, limit, offset)
            return self._success_response(
                data={
                    "items": members,
                    "limit": limit,
                    "offset": offset,
                    "count": len(members),
                    "filters": {"search": search, "role": normalized_role},
                },
                team_members=members,
            )
        except Exception as exc:
            return self._error_response(f"Error retrieving filtered team members: {exc}")

    def get_team_members_grouped_by_role(self):
        result = self.get_all_team_members(limit=1000, offset=0)
        if not result["success"]:
            return result

        grouped = {role: [] for role in self.ROLE_ORDER}
        for member in result["data"]["items"]:
            grouped.setdefault(member.get("role") or "Member", []).append(member)
        return self._success_response(data=grouped, grouped_members=grouped)

    def get_team_stats(self):
        cursor = None
        try:
            cursor = self.db.get_cursor()
            cursor.execute("SELECT COUNT(*) AS total_members FROM Team")
            total_members = int((cursor.fetchone() or {}).get("total_members") or 0)
            cursor.execute(
                f"""
                SELECT role, COUNT(*) AS count
                FROM Team
                GROUP BY role
                ORDER BY {self.ROLE_ORDER_SQL}, role ASC
                """
            )
            role_breakdown = cursor.fetchall()
            return self._success_response(
                data={"total_members": total_members, "role_breakdown": role_breakdown}
            )
        except Exception as exc:
            return self._error_response(f"Error retrieving team stats: {exc}")
        finally:
            self._close_cursor(cursor)
            self._close_db()

    def update_team_member(self, member_id, member_details):
        validation = self._validate_member_payload(member_details, partial=True)
        if not validation["success"]:
            return validation

        cursor = None
        try:
            cleaned = validation["data"]
            cursor = self.db.get_cursor()
            cursor.execute("SELECT * FROM Team WHERE id = %s", (member_id,))
            if not cursor.fetchone():
                return self._error_response("Team member not found")

            if "roll_no" in cleaned:
                cursor.execute(
                    "SELECT id FROM Team WHERE roll_no = %s AND id != %s",
                    (cleaned["roll_no"], member_id),
                )
                if cursor.fetchone():
                    return self._error_response("Another team member with this roll_no already exists")

            fields = [f"{field} = %s" for field in cleaned]
            values = list(cleaned.values()) + [member_id]
            cursor.execute(f"UPDATE Team SET {', '.join(fields)} WHERE id = %s", tuple(values))
            self.db.commit()
            return self._success_response(message="Team member updated successfully")
        except Exception as exc:
            self.db.rollback()
            return self._error_response(f"Error updating team member: {exc}")
        finally:
            self._close_cursor(cursor)
            self._close_db()

    def get_team_member(self, member_id):
        cursor = None
        try:
            cursor = self.db.get_cursor()
            cursor.execute("SELECT * FROM Team WHERE id = %s", (member_id,))
            member = cursor.fetchone()
            if not member:
                return self._error_response("Team member not found")
            return self._success_response(data=member, team_member=member)
        except Exception as exc:
            return self._error_response(f"Error retrieving team member {member_id}: {exc}")
        finally:
            self._close_cursor(cursor)
            self._close_db()

    def delete_team_member(self, member_id):
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
        except Exception as exc:
            self.db.rollback()
            return self._error_response(f"Error deleting team member: {exc}")
        finally:
            self._close_cursor(cursor)
            self._close_db()

    def Search_member(self, name):
        return self.get_filtered_team_members(search=name)


class TeamManagement(TeamManagament):
    pass
