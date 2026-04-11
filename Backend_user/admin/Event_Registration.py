from datetime import datetime

<<<<<<< Updated upstream
=======
<<<<<<< HEAD
from ..Database import Database


class EventRegistration:
    """
    Admin service for event management.
    Handles event creation, editing, deletion, and statistics for administrators.
    """

    def __init__(self):
        """Set up the event registration service with the shared database helper."""
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

    def _validate_date(self, date_str):
        """Validate that the event date is in YYYY-MM-DD format."""
        try:
            datetime.strptime(str(date_str), "%Y-%m-%d")
=======
>>>>>>> Stashed changes
from .base import AdminServiceBase


class EventRegistration(AdminServiceBase):
    def _validate_date(self, value):
        try:
            datetime.strptime(str(value), "%Y-%m-%d")
<<<<<<< Updated upstream
=======
>>>>>>> 2f2962dab9d3219bb71e3a0d704e4ebffc7295f2
>>>>>>> Stashed changes
            return True, None
        except (TypeError, ValueError):
            return False, "Invalid date format. Use YYYY-MM-DD"

<<<<<<< Updated upstream
    def _validate_time(self, value):
        try:
            datetime.strptime(str(value), "%H:%M")
=======
<<<<<<< HEAD
    def _validate_time(self, time_str):
        """Validate that the event time is in HH:MM format."""
        try:
            datetime.strptime(str(time_str), "%H:%M")
=======
    def _validate_time(self, value):
        try:
            datetime.strptime(str(value), "%H:%M")
>>>>>>> 2f2962dab9d3219bb71e3a0d704e4ebffc7295f2
>>>>>>> Stashed changes
            return True, None
        except (TypeError, ValueError):
            return False, "Invalid time format. Use HH:MM"

<<<<<<< Updated upstream
=======
<<<<<<< HEAD
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

    def _validate_event_payload(self, event_data, partial=False):
        """Validate event data for create or update requests."""
        if not isinstance(event_data, dict):
            return self._error_response("Event data must be a dictionary")

        allowed_fields = [
=======
>>>>>>> Stashed changes
    def _validate_event_payload(self, event_data, partial=False):
        if not isinstance(event_data, dict):
            return self._error_response("Event data must be a dictionary")

        cleaned = {}
        required = {"title", "description", "date", "time", "location", "organizer"}

        for field in [
<<<<<<< Updated upstream
=======
>>>>>>> 2f2962dab9d3219bb71e3a0d704e4ebffc7295f2
>>>>>>> Stashed changes
            "title",
            "description",
            "date",
            "time",
            "location",
            "organizer",
            "max_participants",
<<<<<<< Updated upstream
=======
<<<<<<< HEAD
        ]
        required_fields = ["title", "description", "date", "time", "location", "organizer"]

        cleaned_data = {}

        for field in allowed_fields:
            if field not in event_data:
                continue

            value = event_data.get(field)

            if field == "max_participants":
                if value in ("", None):
                    cleaned_data[field] = None
=======
>>>>>>> Stashed changes
        ]:
            if field not in event_data:
                continue

            value = event_data[field]
            if field == "max_participants":
                if value in ("", None):
                    cleaned[field] = None
<<<<<<< Updated upstream
=======
>>>>>>> 2f2962dab9d3219bb71e3a0d704e4ebffc7295f2
>>>>>>> Stashed changes
                    continue
                try:
                    value = int(value)
                except (TypeError, ValueError):
                    return self._error_response("max_participants must be a positive integer")
                if value <= 0:
                    return self._error_response("max_participants must be a positive integer")
<<<<<<< Updated upstream
=======
<<<<<<< HEAD
                cleaned_data[field] = value
                continue

            if isinstance(value, str):
                value = value.strip()

            if field in required_fields and not partial and not value:
                return self._error_response(f"{field} is required")

            if value is not None and value != "":
                cleaned_data[field] = value
            elif field in required_fields and partial and field in event_data:
                return self._error_response(f"{field} cannot be empty")

        if not partial:
            missing_fields = [field for field in required_fields if not cleaned_data.get(field)]
            if missing_fields:
                return self._error_response(
                    f"Missing required fields: {', '.join(missing_fields)}"
                )

        if "date" in cleaned_data:
            is_valid, error = self._validate_date(cleaned_data["date"])
            if not is_valid:
                return self._error_response(error)

        if "time" in cleaned_data:
            is_valid, error = self._validate_time(cleaned_data["time"])
            if not is_valid:
                return self._error_response(error)

        if partial and not cleaned_data:
            return self._error_response("No valid fields to update")

        return self._success_response(data=cleaned_data)

    def _build_event_summary(self, event):
        """Add registration summary details like seats left and full status."""
        if not event:
            return None

        registered_count = int(event.get("registered_count") or 0)
        max_participants = event.get("max_participants")

        if max_participants in ("", None):
            seats_left = None
            is_full = False
        else:
            try:
                max_participants = int(max_participants)
            except (TypeError, ValueError):
                max_participants = None

            if max_participants is None:
                seats_left = None
                is_full = False
            else:
                seats_left = max(max_participants - registered_count, 0)
                is_full = seats_left == 0

        event["registered_count"] = registered_count
        event["seats_left"] = seats_left
        event["is_full"] = is_full
        return event

    def EventCreation(self, event_data):
        """Create a new event after validating the incoming event details."""
        validation = self._validate_event_payload(event_data, partial=False)
        if not validation["success"]:
            return validation

        try:
            result = self.db.Eventaddition(validation["data"])
            if result.get("success"):
                return self._success_response(
                    data={"event_id": result.get("event_id")},
                    message="Event created successfully",
                    event_id=result.get("event_id"),
                )
            return self._error_response(result.get("error", "Failed to create event"))
        except Exception as e:
            return self._error_response(f"Failed to create event: {str(e)}")
        finally:
            self._close_db()

    def get_all_events(
        self,
        limit=10,
        offset=0,
        search_title=None,
        search_organizer=None,
        search_location=None,
    ):
        """Return paginated events with optional title, organizer, and location filters."""
        cursor = None

        is_valid, limit, offset, error = self._validate_limit_offset(limit, offset)
        if not is_valid:
            return self._error_response(error)

        try:
            cursor = self.db.get_cursor()
            conditions = []
            values = []

            if search_title:
                conditions.append("e.title LIKE %s")
                values.append(f"%{str(search_title).strip()}%")

            if search_organizer:
                conditions.append("e.organizer LIKE %s")
                values.append(f"%{str(search_organizer).strip()}%")

            if search_location:
                conditions.append("e.location LIKE %s")
                values.append(f"%{str(search_location).strip()}%")

            where_clause = ""
            if conditions:
                where_clause = "WHERE " + " AND ".join(conditions)

            sql = f"""
=======
>>>>>>> Stashed changes
            elif isinstance(value, str):
                value = value.strip()

            if field in required and not partial and not value:
                return self._error_response(f"{field} is required")
            if field in required and partial and field in event_data and value in ("", None):
                return self._error_response(f"{field} cannot be empty")
            if value is not None and value != "":
                cleaned[field] = value

        if not partial:
            missing = [field for field in required if not cleaned.get(field)]
            if missing:
                return self._error_response(f"Missing required fields: {', '.join(missing)}")
        elif not cleaned:
            return self._error_response("No valid fields to update")

        for field, validator in (("date", self._validate_date), ("time", self._validate_time)):
            if field in cleaned:
                is_valid, error = validator(cleaned[field])
                if not is_valid:
                    return self._error_response(error)

        return self._success_response(data=cleaned)

    def _build_event_summary(self, event):
        if not event:
            return None

        count = int(event.get("registered_count") or 0)
        max_participants = event.get("max_participants")
        try:
            max_participants = None if max_participants in ("", None) else int(max_participants)
        except (TypeError, ValueError):
            max_participants = None

        event["registered_count"] = count
        event["seats_left"] = None if max_participants is None else max(max_participants - count, 0)
        event["is_full"] = bool(max_participants is not None and event["seats_left"] == 0)
        return event

    def _event_query(self, where_clause=""):
        return f"""
<<<<<<< Updated upstream
=======
>>>>>>> 2f2962dab9d3219bb71e3a0d704e4ebffc7295f2
>>>>>>> Stashed changes
            SELECT e.id, e.title, e.description, e.date, e.time, e.location, e.organizer,
                   e.max_participants, e.created_at, COUNT(er.id) AS registered_count
            FROM events e
            LEFT JOIN event_registrations er ON e.id = er.event_id
            {where_clause}
            GROUP BY e.id, e.title, e.description, e.date, e.time, e.location,
                     e.organizer, e.max_participants, e.created_at
<<<<<<< Updated upstream
=======
<<<<<<< HEAD
            ORDER BY e.date DESC, e.time DESC
            LIMIT %s OFFSET %s
            """
            values.extend([limit, offset])
            cursor.execute(sql, tuple(values))
            events = [self._build_event_summary(event) for event in cursor.fetchall()]

=======
>>>>>>> Stashed changes
        """

    def _fetch_events(self, limit, offset, conditions=None, values=None):
        cursor = None
        try:
            cursor = self.db.get_cursor()
            where_clause = f"WHERE {' AND '.join(conditions)}" if conditions else ""
            sql = self._event_query(where_clause) + "\nORDER BY e.date DESC, e.time DESC\nLIMIT %s OFFSET %s"
            params = [*(values or []), limit, offset]
            cursor.execute(sql, tuple(params))
            return [self._build_event_summary(event) for event in cursor.fetchall()]
        finally:
            self._close_cursor(cursor)
            self._close_db()

    def EventCreation(self, event_data):
        validation = self._validate_event_payload(event_data)
        if not validation["success"]:
            return validation
        try:
            result = self.db.Eventaddition(validation["data"])
            if result.get("success"):
                event_id = result.get("event_id")
                return self._success_response(
                    data={"event_id": event_id},
                    message="Event created successfully",
                    event_id=event_id,
                )
            return self._error_response(result.get("error", "Failed to create event"))
        except Exception as exc:
            return self._error_response(f"Failed to create event: {exc}")
        finally:
            self._close_db()

    def get_all_events(
        self, limit=10, offset=0, search_title=None, search_organizer=None, search_location=None
    ):
        is_valid, limit, offset, error = self._validate_limit_offset(limit, offset)
        if not is_valid:
            return self._error_response(error)

        conditions, values = [], []
        for field, value in {
            "e.title LIKE %s": search_title,
            "e.organizer LIKE %s": search_organizer,
            "e.location LIKE %s": search_location,
        }.items():
            if value:
                conditions.append(field)
                values.append(f"%{str(value).strip()}%")

        try:
            events = self._fetch_events(limit, offset, conditions, values)
<<<<<<< Updated upstream
=======
>>>>>>> 2f2962dab9d3219bb71e3a0d704e4ebffc7295f2
>>>>>>> Stashed changes
            return self._success_response(
                data={
                    "items": events,
                    "limit": limit,
                    "offset": offset,
                    "count": len(events),
                    "filters": {
                        "search_title": search_title,
                        "search_organizer": search_organizer,
                        "search_location": search_location,
                    },
                },
                events=events,
            )
<<<<<<< Updated upstream
=======
<<<<<<< HEAD
        except Exception as e:
            return self._error_response(f"Failed to fetch events: {str(e)}")
        finally:
            self._close_cursor(cursor)
            self._close_db()

    def get_filtered_events(self, limit=10, offset=0, search=None, organizer=None, status=None):
        """Return paginated events filtered by search text, organizer, and time status."""
        cursor = None

        is_valid, limit, offset, error = self._validate_limit_offset(limit, offset)
        if not is_valid:
            return self._error_response(error)

        if status not in (None, "upcoming", "past"):
            return self._error_response("status must be 'upcoming', 'past', or None")

        try:
            cursor = self.db.get_cursor()
            conditions = []
            values = []

            if search:
                search_value = f"%{str(search).strip()}%"
                conditions.append("(e.title LIKE %s OR e.location LIKE %s OR e.organizer LIKE %s)")
                values.extend([search_value, search_value, search_value])

            if organizer:
                conditions.append("e.organizer = %s")
                values.append(str(organizer).strip())

            if status == "upcoming":
                conditions.append("CONCAT(e.date, ' ', e.time) > NOW()")
            elif status == "past":
                conditions.append("CONCAT(e.date, ' ', e.time) <= NOW()")

            where_clause = ""
            if conditions:
                where_clause = "WHERE " + " AND ".join(conditions)

            sql = f"""
            SELECT e.id, e.title, e.description, e.date, e.time, e.location, e.organizer,
                   e.max_participants, e.created_at, COUNT(er.id) AS registered_count
            FROM events e
            LEFT JOIN event_registrations er ON e.id = er.event_id
            {where_clause}
            GROUP BY e.id, e.title, e.description, e.date, e.time, e.location,
                     e.organizer, e.max_participants, e.created_at
            ORDER BY e.date DESC, e.time DESC
            LIMIT %s OFFSET %s
            """
            values.extend([limit, offset])
            cursor.execute(sql, tuple(values))
            events = [self._build_event_summary(event) for event in cursor.fetchall()]

=======
>>>>>>> Stashed changes
        except Exception as exc:
            return self._error_response(f"Failed to fetch events: {exc}")

    def get_filtered_events(self, limit=10, offset=0, search=None, organizer=None, status=None):
        is_valid, limit, offset, error = self._validate_limit_offset(limit, offset)
        if not is_valid:
            return self._error_response(error)
        if status not in (None, "upcoming", "past"):
            return self._error_response("status must be 'upcoming', 'past', or None")

        conditions, values = [], []
        if search:
            search_value = f"%{str(search).strip()}%"
            conditions.append("(e.title LIKE %s OR e.location LIKE %s OR e.organizer LIKE %s)")
            values.extend([search_value, search_value, search_value])
        if organizer:
            conditions.append("e.organizer = %s")
            values.append(str(organizer).strip())
        if status == "upcoming":
            conditions.append("CONCAT(e.date, ' ', e.time) > NOW()")
        elif status == "past":
            conditions.append("CONCAT(e.date, ' ', e.time) <= NOW()")

        try:
            events = self._fetch_events(limit, offset, conditions, values)
<<<<<<< Updated upstream
=======
>>>>>>> 2f2962dab9d3219bb71e3a0d704e4ebffc7295f2
>>>>>>> Stashed changes
            return self._success_response(
                data={
                    "items": events,
                    "limit": limit,
                    "offset": offset,
                    "count": len(events),
<<<<<<< Updated upstream
=======
<<<<<<< HEAD
                    "filters": {
                        "search": search,
                        "organizer": organizer,
                        "status": status,
                    },
                },
                events=events,
            )
        except Exception as e:
            return self._error_response(f"Failed to fetch filtered events: {str(e)}")
        finally:
            self._close_cursor(cursor)
            self._close_db()

    def get_event_by_id(self, event_id):
        """Fetch one event by id along with registration summary details."""
        cursor = None

        try:
            cursor = self.db.get_cursor()
            sql = """
            SELECT e.id, e.title, e.description, e.date, e.time, e.location, e.organizer,
                   e.max_participants, e.created_at, COUNT(er.id) AS registered_count
            FROM events e
            LEFT JOIN event_registrations er ON e.id = er.event_id
            WHERE e.id = %s
            GROUP BY e.id, e.title, e.description, e.date, e.time, e.location,
                     e.organizer, e.max_participants, e.created_at
            """
            cursor.execute(sql, (event_id,))
            event = cursor.fetchone()

            if not event:
                return self._error_response("Event not found")

            event = self._build_event_summary(event)
            return self._success_response(data=event, event=event)
        except Exception as e:
            return self._error_response(f"Failed to fetch event: {str(e)}")
=======
>>>>>>> Stashed changes
                    "filters": {"search": search, "organizer": organizer, "status": status},
                },
                events=events,
            )
        except Exception as exc:
            return self._error_response(f"Failed to fetch filtered events: {exc}")

    def get_event_by_id(self, event_id):
        cursor = None
        try:
            cursor = self.db.get_cursor()
            cursor.execute(self._event_query("WHERE e.id = %s"), (event_id,))
            event = cursor.fetchone()
            if not event:
                return self._error_response("Event not found")
            event = self._build_event_summary(event)
            return self._success_response(data=event, event=event)
        except Exception as exc:
            return self._error_response(f"Failed to fetch event: {exc}")
<<<<<<< Updated upstream
=======
>>>>>>> 2f2962dab9d3219bb71e3a0d704e4ebffc7295f2
>>>>>>> Stashed changes
        finally:
            self._close_cursor(cursor)
            self._close_db()

    def update_event(self, event_id, event_data):
<<<<<<< Updated upstream
=======
<<<<<<< HEAD
        """Update selected event fields after validating the new values."""
        cursor = None

=======
>>>>>>> 2f2962dab9d3219bb71e3a0d704e4ebffc7295f2
>>>>>>> Stashed changes
        validation = self._validate_event_payload(event_data, partial=True)
        if not validation["success"]:
            return validation

<<<<<<< Updated upstream
        cursor = None
=======
<<<<<<< HEAD
        cleaned_data = validation["data"]

=======
        cursor = None
>>>>>>> 2f2962dab9d3219bb71e3a0d704e4ebffc7295f2
>>>>>>> Stashed changes
        try:
            cursor = self.db.get_cursor()
            cursor.execute(
                """
                SELECT e.id, e.max_participants, COUNT(er.id) AS registered_count
                FROM events e
                LEFT JOIN event_registrations er ON e.id = er.event_id
                WHERE e.id = %s
                GROUP BY e.id, e.max_participants
                """,
                (event_id,),
            )
<<<<<<< Updated upstream
=======
<<<<<<< HEAD
            existing_event = cursor.fetchone()

            if not existing_event:
                return self._error_response("Event not found")

            registered_count = int(existing_event.get("registered_count") or 0)
            if "max_participants" in cleaned_data:
                new_max = cleaned_data["max_participants"]
                if new_max is not None and new_max < registered_count:
                    return self._error_response(
                        "max_participants cannot be less than current registered count"
                    )

            update_fields = []
            values = []
            for field, value in cleaned_data.items():
                update_fields.append(f"{field} = %s")
                values.append(value)

            sql = f"UPDATE events SET {', '.join(update_fields)} WHERE id = %s"
            values.append(event_id)
            cursor.execute(sql, tuple(values))
            self.db.commit()

            return self._success_response(message="Event updated successfully")
        except Exception as e:
            self.db.rollback()
            return self._error_response(f"Failed to update event: {str(e)}")
=======
>>>>>>> Stashed changes
            existing = cursor.fetchone()
            if not existing:
                return self._error_response("Event not found")

            new_max = validation["data"].get("max_participants")
            if new_max is not None and new_max < int(existing.get("registered_count") or 0):
                return self._error_response(
                    "max_participants cannot be less than current registered count"
                )

            fields = [f"{field} = %s" for field in validation["data"]]
            values = list(validation["data"].values()) + [event_id]
            cursor.execute(f"UPDATE events SET {', '.join(fields)} WHERE id = %s", tuple(values))
            self.db.commit()
            return self._success_response(message="Event updated successfully")
        except Exception as exc:
            self.db.rollback()
            return self._error_response(f"Failed to update event: {exc}")
<<<<<<< Updated upstream
=======
>>>>>>> 2f2962dab9d3219bb71e3a0d704e4ebffc7295f2
>>>>>>> Stashed changes
        finally:
            self._close_cursor(cursor)
            self._close_db()

    def delete_event(self, event_id, force_delete=False):
<<<<<<< Updated upstream
        cursor = None
=======
<<<<<<< HEAD
        """Delete an event safely and optionally delete related registrations first."""
        cursor = None

=======
        cursor = None
>>>>>>> 2f2962dab9d3219bb71e3a0d704e4ebffc7295f2
>>>>>>> Stashed changes
        try:
            cursor = self.db.get_cursor()
            cursor.execute("SELECT id FROM events WHERE id = %s", (event_id,))
            if not cursor.fetchone():
                return self._error_response("Event not found")

            cursor.execute(
                "SELECT COUNT(*) AS registered_count FROM event_registrations WHERE event_id = %s",
                (event_id,),
            )
<<<<<<< Updated upstream
=======
<<<<<<< HEAD
            registered_count = int(cursor.fetchone()["registered_count"])

            if registered_count > 0 and not force_delete:
                return self._error_response(
                    "Event has registrations and cannot be deleted without force_delete=True"
                )

            if registered_count > 0 and force_delete:
=======
>>>>>>> Stashed changes
            count = int(cursor.fetchone()["registered_count"])
            if count > 0 and not force_delete:
                return self._error_response(
                    "Event has registrations and cannot be deleted without force_delete=True"
                )
            if count > 0:
<<<<<<< Updated upstream
=======
>>>>>>> 2f2962dab9d3219bb71e3a0d704e4ebffc7295f2
>>>>>>> Stashed changes
                cursor.execute("DELETE FROM event_registrations WHERE event_id = %s", (event_id,))

            cursor.execute("DELETE FROM events WHERE id = %s", (event_id,))
            self.db.commit()
<<<<<<< Updated upstream
=======
<<<<<<< HEAD

=======
>>>>>>> 2f2962dab9d3219bb71e3a0d704e4ebffc7295f2
>>>>>>> Stashed changes
            return self._success_response(
                data={"event_id": event_id, "force_delete": force_delete},
                message="Event deleted successfully",
            )
<<<<<<< Updated upstream
        except Exception as exc:
            self.db.rollback()
            return self._error_response(f"Failed to delete event: {exc}")
=======
<<<<<<< HEAD
        except Exception as e:
            self.db.rollback()
            return self._error_response(f"Failed to delete event: {str(e)}")
=======
        except Exception as exc:
            self.db.rollback()
            return self._error_response(f"Failed to delete event: {exc}")
>>>>>>> 2f2962dab9d3219bb71e3a0d704e4ebffc7295f2
>>>>>>> Stashed changes
        finally:
            self._close_cursor(cursor)
            self._close_db()

    def get_event_stats(self):
<<<<<<< Updated upstream
        cursor = None
=======
<<<<<<< HEAD
        """Return total, upcoming, and past event counts."""
        cursor = None

=======
        cursor = None
>>>>>>> 2f2962dab9d3219bb71e3a0d704e4ebffc7295f2
>>>>>>> Stashed changes
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
            stats = cursor.fetchone() or {}
<<<<<<< Updated upstream
=======
<<<<<<< HEAD
            data = {
                "total_events": int(stats.get("total_events") or 0),
                "upcoming_events": int(stats.get("upcoming_events") or 0),
                "past_events": int(stats.get("past_events") or 0),
            }
            return self._success_response(data=data)
        except Exception as e:
            return self._error_response(f"Failed to get stats: {str(e)}")
=======
>>>>>>> Stashed changes
            return self._success_response(
                data={
                    "total_events": int(stats.get("total_events") or 0),
                    "upcoming_events": int(stats.get("upcoming_events") or 0),
                    "past_events": int(stats.get("past_events") or 0),
                }
            )
        except Exception as exc:
            return self._error_response(f"Failed to get stats: {exc}")
<<<<<<< Updated upstream
=======
>>>>>>> 2f2962dab9d3219bb71e3a0d704e4ebffc7295f2
>>>>>>> Stashed changes
        finally:
            self._close_cursor(cursor)
            self._close_db()

    def get_event_registration_count(self, event_id):
<<<<<<< Updated upstream
        cursor = None
=======
<<<<<<< HEAD
        """Return the number of registrations linked to one event."""
        cursor = None

=======
        cursor = None
>>>>>>> 2f2962dab9d3219bb71e3a0d704e4ebffc7295f2
>>>>>>> Stashed changes
        try:
            cursor = self.db.get_cursor()
            cursor.execute("SELECT id FROM events WHERE id = %s", (event_id,))
            if not cursor.fetchone():
                return self._error_response("Event not found")

            cursor.execute(
<<<<<<< Updated upstream
=======
<<<<<<< HEAD
                """
                SELECT COUNT(*) AS registered_count
                FROM event_registrations
                WHERE event_id = %s
                """,
                (event_id,),
            )
            registered_count = int(cursor.fetchone()["registered_count"])
            data = {"event_id": event_id, "registered_count": registered_count}
            return self._success_response(
                data=data,
                event_id=event_id,
                registered_count=registered_count,
            )
        except Exception as e:
            return self._error_response(f"Failed to get registration count: {str(e)}")
=======
>>>>>>> Stashed changes
                "SELECT COUNT(*) AS registered_count FROM event_registrations WHERE event_id = %s",
                (event_id,),
            )
            count = int(cursor.fetchone()["registered_count"])
            data = {"event_id": event_id, "registered_count": count}
            return self._success_response(data=data, event_id=event_id, registered_count=count)
        except Exception as exc:
            return self._error_response(f"Failed to get registration count: {exc}")
<<<<<<< Updated upstream
=======
>>>>>>> 2f2962dab9d3219bb71e3a0d704e4ebffc7295f2
>>>>>>> Stashed changes
        finally:
            self._close_cursor(cursor)
            self._close_db()

    def get_all_event_registration_counts(self):
<<<<<<< Updated upstream
        cursor = None
=======
<<<<<<< HEAD
        """Return registration counts for all events."""
        cursor = None

=======
        cursor = None
>>>>>>> 2f2962dab9d3219bb71e3a0d704e4ebffc7295f2
>>>>>>> Stashed changes
        try:
            cursor = self.db.get_cursor()
            cursor.execute(
                """
                SELECT e.id, e.title, COUNT(er.id) AS registered_count
                FROM events e
                LEFT JOIN event_registrations er ON e.id = er.event_id
                GROUP BY e.id, e.title
                ORDER BY registered_count DESC, e.date DESC, e.time DESC
                """
            )
<<<<<<< Updated upstream
=======
<<<<<<< HEAD
            event_registration_counts = cursor.fetchall()
            return self._success_response(
                data=event_registration_counts,
                event_registration_counts=event_registration_counts,
            )
        except Exception as e:
            return self._error_response(
                f"Failed to get event registration counts: {str(e)}"
            )
=======
>>>>>>> Stashed changes
            rows = cursor.fetchall()
            return self._success_response(data=rows, event_registration_counts=rows)
        except Exception as exc:
            return self._error_response(f"Failed to get event registration counts: {exc}")
<<<<<<< Updated upstream
=======
>>>>>>> 2f2962dab9d3219bb71e3a0d704e4ebffc7295f2
>>>>>>> Stashed changes
        finally:
            self._close_cursor(cursor)
            self._close_db()

    def get_event_registrations(self, event_id, limit=50, offset=0):
<<<<<<< Updated upstream
=======
<<<<<<< HEAD
        """Return paginated registration rows for a specific event."""
        cursor = None

=======
>>>>>>> 2f2962dab9d3219bb71e3a0d704e4ebffc7295f2
>>>>>>> Stashed changes
        is_valid, limit, offset, error = self._validate_limit_offset(limit, offset)
        if not is_valid:
            return self._error_response(error)

<<<<<<< Updated upstream
        cursor = None
=======
<<<<<<< HEAD
=======
        cursor = None
>>>>>>> 2f2962dab9d3219bb71e3a0d704e4ebffc7295f2
>>>>>>> Stashed changes
        try:
            cursor = self.db.get_cursor()
            cursor.execute("SELECT id FROM events WHERE id = %s", (event_id,))
            if not cursor.fetchone():
                return self._error_response("Event not found")

<<<<<<< Updated upstream
=======
<<<<<<< HEAD
            # Assumes event_registrations supports event_id and can be safely returned with SELECT *.
=======
>>>>>>> 2f2962dab9d3219bb71e3a0d704e4ebffc7295f2
>>>>>>> Stashed changes
            cursor.execute(
                """
                SELECT *
                FROM event_registrations
                WHERE event_id = %s
                ORDER BY id DESC
                LIMIT %s OFFSET %s
                """,
                (event_id, limit, offset),
            )
            registrations = cursor.fetchall()
<<<<<<< Updated upstream
=======
<<<<<<< HEAD

=======
>>>>>>> 2f2962dab9d3219bb71e3a0d704e4ebffc7295f2
>>>>>>> Stashed changes
            return self._success_response(
                data={
                    "event_id": event_id,
                    "items": registrations,
                    "limit": limit,
                    "offset": offset,
                    "count": len(registrations),
                },
                registrations=registrations,
            )
<<<<<<< Updated upstream
=======
<<<<<<< HEAD
        except Exception as e:
            return self._error_response(f"Failed to fetch event registrations: {str(e)}")
        finally:
            self._close_cursor(cursor)
            self._close_db()


if __name__ == "__main__":
    event_admin = EventRegistration()
    print(event_admin.delete_event(1))
=======
>>>>>>> Stashed changes
        except Exception as exc:
            return self._error_response(f"Failed to fetch event registrations: {exc}")
        finally:
            self._close_cursor(cursor)
            self._close_db()
<<<<<<< Updated upstream
=======
>>>>>>> 2f2962dab9d3219bb71e3a0d704e4ebffc7295f2
>>>>>>> Stashed changes
