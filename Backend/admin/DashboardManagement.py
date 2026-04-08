from ..Database import Database


class DashboardManagement:
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

    def __init__(self):
        """Set up the dashboard service with the shared database helper."""
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

    def _validate_limit(self, limit):
        """Validate a limit value used by dashboard list helpers."""
        try:
            limit = int(limit)
        except (TypeError, ValueError):
            return False, None, "limit must be an integer"

        if limit <= 0:
            return False, None, "limit must be greater than 0"

        return True, limit, None

    def get_dashboard_counts(self):
        """Return dashboard totals and extra event insight counts."""
        cursor = None

        try:
            cursor = self.db.get_cursor()
            cursor.execute(
                """
                SELECT
                    COUNT(*) AS total_events,
                    SUM(CASE WHEN CONCAT(date, ' ', time) > NOW() THEN 1 ELSE 0 END) AS upcoming_events,
                    SUM(CASE WHEN CONCAT(date, ' ', time) <= NOW() THEN 1 ELSE 0 END) AS past_events
                FROM events
                """
            )
            event_counts = cursor.fetchone() or {}

            cursor.execute("SELECT COUNT(*) AS total_resources FROM resources")
            total_resources = (cursor.fetchone() or {}).get("total_resources") or 0

            cursor.execute("SELECT COUNT(*) AS total_team_members FROM Team")
            total_team_members = (cursor.fetchone() or {}).get("total_team_members") or 0

            cursor.execute("SELECT COUNT(*) AS total_registrations FROM event_registrations")
            total_registrations = (cursor.fetchone() or {}).get("total_registrations") or 0

            cursor.execute(
                """
                SELECT COUNT(*) AS full_events
                FROM events e
                LEFT JOIN (
                    SELECT event_id, COUNT(*) AS registered_count
                    FROM event_registrations
                    GROUP BY event_id
                ) er ON e.id = er.event_id
                WHERE e.max_participants IS NOT NULL
                  AND e.max_participants > 0
                  AND COALESCE(er.registered_count, 0) >= e.max_participants
                """
            )
            full_events = (cursor.fetchone() or {}).get("full_events") or 0

            cursor.execute(
                """
                SELECT COUNT(*) AS events_with_no_registrations
                FROM events e
                LEFT JOIN event_registrations er ON e.id = er.event_id
                WHERE er.id IS NULL
                """
            )
            events_with_no_registrations = (
                cursor.fetchone() or {}
            ).get("events_with_no_registrations") or 0

            counts = {
                "total_events": int(event_counts.get("total_events") or 0),
                "upcoming_events": int(event_counts.get("upcoming_events") or 0),
                "past_events": int(event_counts.get("past_events") or 0),
                "total_resources": int(total_resources),
                "total_team_members": int(total_team_members),
                "total_registrations": int(total_registrations),
                "full_events": int(full_events),
                "events_with_no_registrations": int(events_with_no_registrations),
            }

            return self._success_response(data=counts, counts=counts)
        except Exception as e:
            return self._error_response(f"Error getting dashboard counts: {str(e)}")
        finally:
            self._close_cursor(cursor)
            self._close_db()

    def get_recent_events(self, limit=5):
        """Return the most recent events with registration and seat summaries."""
        cursor = None

        is_valid, limit, error = self._validate_limit(limit)
        if not is_valid:
            return self._error_response(error)

        try:
            cursor = self.db.get_cursor()
            sql = """
            SELECT e.id, e.title, e.description, e.date, e.time, e.location,
                   e.organizer, e.max_participants, e.created_at,
                   COUNT(er.id) AS registered_count
            FROM events e
            LEFT JOIN event_registrations er ON e.id = er.event_id
            GROUP BY e.id, e.title, e.description, e.date, e.time, e.location,
                     e.organizer, e.max_participants, e.created_at
            ORDER BY e.created_at DESC
            LIMIT %s
            """
            cursor.execute(sql, (limit,))
            events = cursor.fetchall()

            for event in events:
                registered_count = int(event.get("registered_count") or 0)
                max_participants = event.get("max_participants")
                if max_participants in (None, ""):
                    event["seats_left"] = None
                    event["is_full"] = False
                else:
                    max_participants = int(max_participants)
                    event["seats_left"] = max(max_participants - registered_count, 0)
                    event["is_full"] = event["seats_left"] == 0

            return self._success_response(data=events, recent_events=events)
        except Exception as e:
            return self._error_response(f"Error getting recent events: {str(e)}")
        finally:
            self._close_cursor(cursor)
            self._close_db()

    def get_recent_resources(self, limit=5):
        """Return the most recently added resources."""
        cursor = None

        is_valid, limit, error = self._validate_limit(limit)
        if not is_valid:
            return self._error_response(error)

        try:
            cursor = self.db.get_cursor()
            cursor.execute(
                """
                SELECT id, title, description, type, url, category, uploaded_by, created_at
                FROM resources
                ORDER BY created_at DESC
                LIMIT %s
                """,
                (limit,),
            )
            resources = cursor.fetchall()
            return self._success_response(data=resources, recent_resources=resources)
        except Exception as e:
            return self._error_response(f"Error getting recent resources: {str(e)}")
        finally:
            self._close_cursor(cursor)
            self._close_db()

    def get_recent_team_members(self, limit=5):
        """Return team members in role-priority order for dashboard display."""
        cursor = None

        is_valid, limit, error = self._validate_limit(limit)
        if not is_valid:
            return self._error_response(error)

        try:
            cursor = self.db.get_cursor()
            sql = f"""
            SELECT id, name, roll_no, url, role
            FROM Team
            ORDER BY {self.ROLE_ORDER_SQL}, name ASC
            LIMIT %s
            """
            cursor.execute(sql, (limit,))
            team_members = cursor.fetchall()
            return self._success_response(data=team_members, recent_team_members=team_members)
        except Exception as e:
            return self._error_response(f"Error getting recent team members: {str(e)}")
        finally:
            self._close_cursor(cursor)
            self._close_db()

    def get_team_role_breakdown(self):
        """Return a grouped count of team members by role."""
        cursor = None

        try:
            cursor = self.db.get_cursor()
            sql = f"""
            SELECT role, COUNT(*) AS count
            FROM Team
            GROUP BY role
            ORDER BY {self.ROLE_ORDER_SQL}, role ASC
            """
            cursor.execute(sql)
            role_breakdown = cursor.fetchall()
            return self._success_response(data=role_breakdown, team_role_breakdown=role_breakdown)
        except Exception as e:
            return self._error_response(f"Error getting team role breakdown: {str(e)}")
        finally:
            self._close_cursor(cursor)
            self._close_db()

    def get_resource_type_breakdown(self):
        """Return a grouped count of resources by type."""
        cursor = None

        try:
            cursor = self.db.get_cursor()
            cursor.execute(
                """
                SELECT type, COUNT(*) AS count
                FROM resources
                GROUP BY type
                ORDER BY count DESC, type ASC
                """
            )
            resource_breakdown = cursor.fetchall()
            return self._success_response(
                data=resource_breakdown,
                resource_type_breakdown=resource_breakdown,
            )
        except Exception as e:
            return self._error_response(f"Error getting resource type breakdown: {str(e)}")
        finally:
            self._close_cursor(cursor)
            self._close_db()

    def get_resource_category_breakdown(self):
        """Return a grouped count of resources by category."""
        cursor = None

        try:
            cursor = self.db.get_cursor()
            cursor.execute(
                """
                SELECT category, COUNT(*) AS count
                FROM resources
                GROUP BY category
                ORDER BY count DESC, category ASC
                """
            )
            category_breakdown = cursor.fetchall()
            return self._success_response(
                data=category_breakdown,
                resource_category_breakdown=category_breakdown,
            )
        except Exception as e:
            return self._error_response(
                f"Error getting resource category breakdown: {str(e)}"
            )
        finally:
            self._close_cursor(cursor)
            self._close_db()

    def get_top_registered_events(self, limit=5):
        """Return the events with the highest registration counts."""
        cursor = None

        is_valid, limit, error = self._validate_limit(limit)
        if not is_valid:
            return self._error_response(error)

        try:
            cursor = self.db.get_cursor()
            cursor.execute(
                """
                SELECT e.id, e.title, e.date, e.time, e.location, COUNT(er.id) AS registered_count
                FROM events e
                LEFT JOIN event_registrations er ON e.id = er.event_id
                GROUP BY e.id, e.title, e.date, e.time, e.location
                ORDER BY registered_count DESC, e.date DESC, e.time DESC
                LIMIT %s
                """,
                (limit,),
            )
            top_registered_events = cursor.fetchall()
            return self._success_response(
                data=top_registered_events,
                top_registered_events=top_registered_events,
            )
        except Exception as e:
            return self._error_response(f"Error getting top registered events: {str(e)}")
        finally:
            self._close_cursor(cursor)
            self._close_db()

    def get_events_with_no_registrations(self, limit=5):
        """Return events that currently have no registrations."""
        cursor = None

        is_valid, limit, error = self._validate_limit(limit)
        if not is_valid:
            return self._error_response(error)

        try:
            cursor = self.db.get_cursor()
            cursor.execute(
                """
                SELECT e.id, e.title, e.date, e.time, e.location, e.organizer
                FROM events e
                LEFT JOIN event_registrations er ON e.id = er.event_id
                WHERE er.id IS NULL
                ORDER BY e.date DESC, e.time DESC
                LIMIT %s
                """,
                (limit,),
            )
            events = cursor.fetchall()
            return self._success_response(
                data=events,
                events_with_no_registrations=events,
            )
        except Exception as e:
            return self._error_response(
                f"Error getting events with no registrations: {str(e)}"
            )
        finally:
            self._close_cursor(cursor)
            self._close_db()

    def get_full_events(self, limit=5):
        """Return events whose registrations have already filled capacity."""
        cursor = None

        is_valid, limit, error = self._validate_limit(limit)
        if not is_valid:
            return self._error_response(error)

        try:
            cursor = self.db.get_cursor()
            cursor.execute(
                """
                SELECT e.id, e.title, e.date, e.time, e.location, e.organizer,
                       e.max_participants, COUNT(er.id) AS registered_count
                FROM events e
                LEFT JOIN event_registrations er ON e.id = er.event_id
                WHERE e.max_participants IS NOT NULL AND e.max_participants > 0
                GROUP BY e.id, e.title, e.date, e.time, e.location, e.organizer, e.max_participants
                HAVING COUNT(er.id) >= e.max_participants
                ORDER BY e.date DESC, e.time DESC
                LIMIT %s
                """,
                (limit,),
            )
            events = cursor.fetchall()
            return self._success_response(data=events, full_events=events)
        except Exception as e:
            return self._error_response(f"Error getting full events: {str(e)}")
        finally:
            self._close_cursor(cursor)
            self._close_db()

    def get_admin_dashboard(self, recent_limit=5):
        """Combine all dashboard sections into a single admin response."""
        counts_result = self.get_dashboard_counts()
        events_result = self.get_recent_events(recent_limit)
        resources_result = self.get_recent_resources(recent_limit)
        team_result = self.get_recent_team_members(recent_limit)
        team_roles_result = self.get_team_role_breakdown()
        resource_types_result = self.get_resource_type_breakdown()
        resource_categories_result = self.get_resource_category_breakdown()
        top_registered_events_result = self.get_top_registered_events(recent_limit)
        full_events_result = self.get_full_events(recent_limit)
        no_registrations_result = self.get_events_with_no_registrations(recent_limit)

        for result in [
            counts_result,
            events_result,
            resources_result,
            team_result,
            team_roles_result,
            resource_types_result,
            resource_categories_result,
            top_registered_events_result,
            full_events_result,
            no_registrations_result,
        ]:
            if not result.get("success"):
                return result

        dashboard = {
            "counts": counts_result["data"],
            "recent_events": events_result["data"],
            "recent_resources": resources_result["data"],
            "recent_team_members": team_result["data"],
            "team_role_breakdown": team_roles_result["data"],
            "resource_type_breakdown": resource_types_result["data"],
            "resource_category_breakdown": resource_categories_result["data"],
            "top_registered_events": top_registered_events_result["data"],
            "full_events": full_events_result["data"],
            "events_with_no_registrations": no_registrations_result["data"],
        }

        return self._success_response(data=dashboard, dashboard=dashboard)


if __name__ == "__main__":
    dashboard = DashboardManagement()
    print(dashboard.get_admin_dashboard())
