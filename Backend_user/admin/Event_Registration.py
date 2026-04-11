from datetime import datetime

from .base import AdminServiceBase


class EventRegistration(AdminServiceBase):
    def _validate_date(self, value):
        try:
            datetime.strptime(str(value), "%Y-%m-%d")
            return True, None
        except (TypeError, ValueError):
            return False, "Invalid date format. Use YYYY-MM-DD"

    def _validate_time(self, value):
        try:
            datetime.strptime(str(value), "%H:%M")
            return True, None
        except (TypeError, ValueError):
            return False, "Invalid time format. Use HH:MM"

    def _validate_event_payload(self, event_data, partial=False):
        if not isinstance(event_data, dict):
            return self._error_response("Event data must be a dictionary")

        cleaned = {}
        required = {"title", "description", "date", "time", "location", "organizer"}

        for field in [
            "title",
            "description",
            "date",
            "time",
            "location",
            "organizer",
            "max_participants",
        ]:
            if field not in event_data:
                continue

            value = event_data[field]
            if field == "max_participants":
                if value in ("", None):
                    cleaned[field] = None
                    continue
                try:
                    value = int(value)
                except (TypeError, ValueError):
                    return self._error_response("max_participants must be a positive integer")
                if value <= 0:
                    return self._error_response("max_participants must be a positive integer")
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
            SELECT e.id, e.title, e.description, e.date, e.time, e.location, e.organizer,
                   e.max_participants, e.created_at, COUNT(er.id) AS registered_count
            FROM events e
            LEFT JOIN event_registrations er ON e.id = er.event_id
            {where_clause}
            GROUP BY e.id, e.title, e.description, e.date, e.time, e.location,
                     e.organizer, e.max_participants, e.created_at
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
            return self._success_response(
                data={
                    "items": events,
                    "limit": limit,
                    "offset": offset,
                    "count": len(events),
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
        finally:
            self._close_cursor(cursor)
            self._close_db()

    def update_event(self, event_id, event_data):
        validation = self._validate_event_payload(event_data, partial=True)
        if not validation["success"]:
            return validation

        cursor = None
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
        finally:
            self._close_cursor(cursor)
            self._close_db()

    def delete_event(self, event_id, force_delete=False):
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
            count = int(cursor.fetchone()["registered_count"])
            if count > 0 and not force_delete:
                return self._error_response(
                    "Event has registrations and cannot be deleted without force_delete=True"
                )
            if count > 0:
                cursor.execute("DELETE FROM event_registrations WHERE event_id = %s", (event_id,))

            cursor.execute("DELETE FROM events WHERE id = %s", (event_id,))
            self.db.commit()
            return self._success_response(
                data={"event_id": event_id, "force_delete": force_delete},
                message="Event deleted successfully",
            )
        except Exception as exc:
            self.db.rollback()
            return self._error_response(f"Failed to delete event: {exc}")
        finally:
            self._close_cursor(cursor)
            self._close_db()

    def get_event_stats(self):
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
            return self._success_response(
                data={
                    "total_events": int(stats.get("total_events") or 0),
                    "upcoming_events": int(stats.get("upcoming_events") or 0),
                    "past_events": int(stats.get("past_events") or 0),
                }
            )
        except Exception as exc:
            return self._error_response(f"Failed to get stats: {exc}")
        finally:
            self._close_cursor(cursor)
            self._close_db()

    def get_event_registration_count(self, event_id):
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
            count = int(cursor.fetchone()["registered_count"])
            data = {"event_id": event_id, "registered_count": count}
            return self._success_response(data=data, event_id=event_id, registered_count=count)
        except Exception as exc:
            return self._error_response(f"Failed to get registration count: {exc}")
        finally:
            self._close_cursor(cursor)
            self._close_db()

    def get_all_event_registration_counts(self):
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
            rows = cursor.fetchall()
            return self._success_response(data=rows, event_registration_counts=rows)
        except Exception as exc:
            return self._error_response(f"Failed to get event registration counts: {exc}")
        finally:
            self._close_cursor(cursor)
            self._close_db()

    def get_event_registrations(self, event_id, limit=50, offset=0):
        is_valid, limit, offset, error = self._validate_limit_offset(limit, offset)
        if not is_valid:
            return self._error_response(error)

        cursor = None
        try:
            cursor = self.db.get_cursor()
            cursor.execute("SELECT id FROM events WHERE id = %s", (event_id,))
            if not cursor.fetchone():
                return self._error_response("Event not found")

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
        except Exception as exc:
            return self._error_response(f"Failed to fetch event registrations: {exc}")
        finally:
            self._close_cursor(cursor)
            self._close_db()
