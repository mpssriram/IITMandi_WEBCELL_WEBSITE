from datetime import datetime

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
            return True, None
        except (TypeError, ValueError):
            return False, "Invalid date format. Use YYYY-MM-DD"

    def _validate_time(self, time_str):
        """Validate that the event time is in HH:MM format."""
        try:
            datetime.strptime(str(time_str), "%H:%M")
            return True, None
        except (TypeError, ValueError):
            return False, "Invalid time format. Use HH:MM"

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
            "title",
            "description",
            "date",
            "time",
            "location",
            "organizer",
            "max_participants",
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
                    continue
                try:
                    value = int(value)
                except (TypeError, ValueError):
                    return self._error_response("max_participants must be a positive integer")
                if value <= 0:
                    return self._error_response("max_participants must be a positive integer")
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

            return self._success_response(
                data={
                    "items": events,
                    "limit": limit,
                    "offset": offset,
                    "count": len(events),
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
        finally:
            self._close_cursor(cursor)
            self._close_db()

    def update_event(self, event_id, event_data):
        """Update selected event fields after validating the new values."""
        cursor = None

        validation = self._validate_event_payload(event_data, partial=True)
        if not validation["success"]:
            return validation

        cleaned_data = validation["data"]

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
        finally:
            self._close_cursor(cursor)
            self._close_db()

    def delete_event(self, event_id, force_delete=False):
        """Delete an event safely and optionally delete related registrations first."""
        cursor = None

        try:
            cursor = self.db.get_cursor()
            cursor.execute("SELECT id FROM events WHERE id = %s", (event_id,))
            if not cursor.fetchone():
                return self._error_response("Event not found")

            cursor.execute(
                "SELECT COUNT(*) AS registered_count FROM event_registrations WHERE event_id = %s",
                (event_id,),
            )
            registered_count = int(cursor.fetchone()["registered_count"])

            if registered_count > 0 and not force_delete:
                return self._error_response(
                    "Event has registrations and cannot be deleted without force_delete=True"
                )

            if registered_count > 0 and force_delete:
                cursor.execute("DELETE FROM event_registrations WHERE event_id = %s", (event_id,))

            cursor.execute("DELETE FROM events WHERE id = %s", (event_id,))
            self.db.commit()

            return self._success_response(
                data={"event_id": event_id, "force_delete": force_delete},
                message="Event deleted successfully",
            )
        except Exception as e:
            self.db.rollback()
            return self._error_response(f"Failed to delete event: {str(e)}")
        finally:
            self._close_cursor(cursor)
            self._close_db()

    def get_event_stats(self):
        """Return total, upcoming, and past event counts."""
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
            stats = cursor.fetchone() or {}
            data = {
                "total_events": int(stats.get("total_events") or 0),
                "upcoming_events": int(stats.get("upcoming_events") or 0),
                "past_events": int(stats.get("past_events") or 0),
            }
            return self._success_response(data=data)
        except Exception as e:
            return self._error_response(f"Failed to get stats: {str(e)}")
        finally:
            self._close_cursor(cursor)
            self._close_db()

    def get_event_registration_count(self, event_id):
        """Return the number of registrations linked to one event."""
        cursor = None

        try:
            cursor = self.db.get_cursor()
            cursor.execute("SELECT id FROM events WHERE id = %s", (event_id,))
            if not cursor.fetchone():
                return self._error_response("Event not found")

            cursor.execute(
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
        finally:
            self._close_cursor(cursor)
            self._close_db()

    def get_all_event_registration_counts(self):
        """Return registration counts for all events."""
        cursor = None

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
            event_registration_counts = cursor.fetchall()
            return self._success_response(
                data=event_registration_counts,
                event_registration_counts=event_registration_counts,
            )
        except Exception as e:
            return self._error_response(
                f"Failed to get event registration counts: {str(e)}"
            )
        finally:
            self._close_cursor(cursor)
            self._close_db()

    def get_event_registrations(self, event_id, limit=50, offset=0):
        """Return paginated registration rows for a specific event."""
        cursor = None

        is_valid, limit, offset, error = self._validate_limit_offset(limit, offset)
        if not is_valid:
            return self._error_response(error)

        try:
            cursor = self.db.get_cursor()
            cursor.execute("SELECT id FROM events WHERE id = %s", (event_id,))
            if not cursor.fetchone():
                return self._error_response("Event not found")

            # Assumes event_registrations supports event_id and can be safely returned with SELECT *.
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
        except Exception as e:
            return self._error_response(f"Failed to fetch event registrations: {str(e)}")
        finally:
            self._close_cursor(cursor)
            self._close_db()

    def export_event_registrations_csv(self, event_id):
        """Return CSV string of all registrations for a specific event."""
        import csv
        import io
        cursor = None

        try:
            cursor = self.db.get_cursor()
            cursor.execute("SELECT title FROM events WHERE id = %s", (event_id,))
            event = cursor.fetchone()
            if not event:
                return self._error_response("Event not found")

            cursor.execute(
                """
                SELECT full_name, email, roll_no, branch, year_of_study, phone, notes, created_at
                FROM event_registrations
                WHERE event_id = %s
                ORDER BY created_at ASC
                """,
                (event_id,),
            )
            registrations = cursor.fetchall()
            
            output = io.StringIO()
            writer = csv.writer(output)
            writer.writerow(["Full Name", "Email", "Roll No", "Branch", "Year of Study", "Phone", "Notes", "Registered At"])
            
            for reg in registrations:
                writer.writerow([
                    reg.get("full_name") or "",
                    reg.get("email") or "",
                    reg.get("roll_no") or "",
                    reg.get("branch") or "",
                    reg.get("year_of_study") or "",
                    reg.get("phone") or "",
                    reg.get("notes") or "",
                    reg.get("created_at") or ""
                ])
                
            return self._success_response(data={"csv_data": output.getvalue(), "filename": f"event_{event_id}_registrations.csv"})
        except Exception as e:
            return self._error_response(f"Failed to export event registrations: {str(e)}")
        finally:
            self._close_cursor(cursor)
            self._close_db()


if __name__ == "__main__":
    event_admin = EventRegistration()
    print(event_admin.delete_event(1))
