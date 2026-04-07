from Backend.Database import Database


class EventRegistration:
    """
    Admin service for event management.
    Handles event creation, editing, deletion, and statistics for administrators.
    """

    def __init__(self):
        self.db = Database()

    def EventCreation(self, event_data):
        """
        Create a new event (Admin only).

        Args:
            event_data (dict): Event information containing:
                - title: Event title (required)
                - description: Event description (required)
                - date: Event date in YYYY-MM-DD format (required)
                - time: Event time in HH:MM format (required)
                - location: Event location (required)
                - organizer: Event organizer (required)
                - max_participants: Maximum number of participants (optional)

        Returns:
            dict: {"success": True, "event_id": id} or {"success": False, "error": message}
        """
        try:
            # Validate required fields
            required_fields = ['title', 'description', 'date', 'time', 'location', 'organizer']
            missing_fields = []

            for field in required_fields:
                if not event_data.get(field):
                    missing_fields.append(field)

            if missing_fields:
                return {
                    "success": False,
                    "error": f"Missing required fields: {', '.join(missing_fields)}"
                }

            # it helps in checking the date and time format so there wont be any parse error(here the format does not match the required format)
            try:
                date_parts = event_data['date'].split('-')
                if len(date_parts) != 3:
                    raise ValueError
                year, month, day = map(int, date_parts)
                if not (2020 <= year <= 2030 and 1 <= month <= 12 and 1 <= day <= 31):
                    raise ValueError
            except:
                return {"success": False, "error": "Invalid date format. Use YYYY-MM-DD"}

            # Validate time format (HH:MM)
            try:
                time_parts = event_data['time'].split(':')
                if len(time_parts) != 2:
                    raise ValueError
                hour, minute = map(int, time_parts)
                if not (0 <= hour <= 23 and 0 <= minute <= 59):
                    raise ValueError
            except:
                return {"success": False, "error": "Invalid time format. Use HH:MM"}

            # cretaes an event in the database 
            result = self.db.Eventaddition(event_data)

            if result.get("success"):
                return {
                    "success": True,
                    "message": "Event created successfully",
                    "event_id": result.get("event_id")
                }
            else:
                return result

        except Exception as e:
            return {"success": False, "error": f"Failed to create event: {str(e)}"}

    def get_all_events(self, limit=10, offset=0):
        """
        Get all events for admin management (with pagination).

        Args:
            limit (int): Maximum number of events to return (default 10)
            offset (int): Number of events to skip for pagination (default 0)

        Returns:
            list: List of event dictionaries or error dict
        """
        try:
            conn = self.db._connect()
            cursor = conn.cursor(dictionary=True)

            sql = """
            SELECT id, title, description, date, time, location, organizer,
                   max_participants, created_at
            FROM events
            ORDER BY date DESC, time DESC
            LIMIT %s OFFSET %s
            """

            cursor.execute(sql, (limit, offset))
            events = cursor.fetchall()

            cursor.close()
            conn.close()

            return events

        except Exception as e:
            return {"success": False, "error": f"Failed to fetch events: {str(e)}"}

    def get_event_by_id(self, event_id):
        """
        Get a specific event by ID for admin editing.

        Args:
            event_id (int): The event ID to fetch

        Returns:
            dict: Event data or error dict
        """
        try:
            conn = self.db._connect()
            cursor = conn.cursor(dictionary=True)

            sql = """
            SELECT id, title, description, date, time, location, organizer,
                   max_participants, created_at
            FROM events
            WHERE id = %s
            """

            cursor.execute(sql, (event_id,))
            event = cursor.fetchone()

            cursor.close()
            conn.close()

            if event:
                return event
            else:
                return {"success": False, "error": "Event not found"}

        except Exception as e:
            return {"success": False, "error": f"Failed to fetch event: {str(e)}"}

    def update_event(self, event_id, event_data):
        """
        Update an existing event (Admin only).

        Args:
            event_id (int): ID of the event to update
            event_data (dict): Updated event data (can include any event fields)

        Returns:
            dict: {"success": True} or {"success": False, "error": message}
        """
        try:
            conn = self.db._connect()
            cursor = conn.cursor(dictionary=True)

            # this code part helps us to check if a event exists or not 
            cursor.execute("SELECT id FROM events WHERE id = %s", (event_id,))
            if not cursor.fetchone():
                return {"success": False, "error": "Event not found"}

            # this code helps in building the update query dynamically
            update_fields = []
            values = []
            allowed_fields = ['title', 'description', 'date', 'time', 'location', 'organizer', 'max_participants']

            for field in allowed_fields:
                if field in event_data:
                    update_fields.append(f"{field} = %s")
                    values.append(event_data[field])

            if not update_fields:
                return {"success": False, "error": "No valid fields to update"}

            sql = f"UPDATE events SET {', '.join(update_fields)} WHERE id = %s"
            values.append(event_id)

            cursor.execute(sql, values)
            self.db.commit()

            cursor.close()
            conn.close()

            return {"success": True, "message": "Event updated successfully"}

        except Exception as e:
            return {"success": False, "error": f"Failed to update event: {str(e)}"}

    def delete_event(self, event_id):
        """
        Delete an event (Admin only).

        Args:
            event_id (int): ID of the event to delete

        Returns:
            dict: {"success": True} or {"success": False, "error": message}
        """
        try:
            conn = self.db._connect()
            cursor = conn.cursor(dictionary=True)

            # Check if event exists
            cursor.execute("SELECT id FROM events WHERE id = %s", (event_id,))
            if not cursor.fetchone():
                return {"success": False, "error": "Event not found"}

            # Deletes the event
            cursor.execute("DELETE FROM events WHERE id = %s", (event_id,))
            self.db.commit()

            cursor.close()
            conn.close()

            return {"success": True, "message": "Event deleted successfully"}

        except Exception as e:
            return {"success": False, "error": f"Failed to delete event: {str(e)}"}

    def get_event_stats(self):
        """
        Get event statistics for admin dashboard.

        Returns:
            dict: {"total_events": int, "upcoming_events": int, "past_events": int}
        """
        try:
            conn = self.db._connect()
            cursor = conn.cursor(dictionary=True)

            # Get total events
            cursor.execute("SELECT COUNT(*) as total_events FROM events")
            total_events = cursor.fetchone()['total_events']

            # Get upcoming events
            cursor.execute("""
            SELECT COUNT(*) as upcoming_events FROM events
            WHERE CONCAT(date, ' ', time) > NOW()
            """)
            upcoming_events = cursor.fetchone()['upcoming_events']

            # Get past events
            cursor.execute("""
            SELECT COUNT(*) as past_events FROM events
            WHERE CONCAT(date, ' ', time) <= NOW()
            """)
            past_events = cursor.fetchone()['past_events']

            cursor.close()
            conn.close()

            return {
                "total_events": total_events,
                "upcoming_events": upcoming_events,
                "past_events": past_events
            }

        except Exception as e:
            return {"success": False, "error": f"Failed to get stats: {str(e)}"}


if __name__ == "__main__":
    event_admin = EventRegistration()

    print("=== Admin Event Management System ===\n")
    print(event_admin.delete_event(1))

    # # Create event
    # print("Creating event...")
    # new_event = {
    #     "title": "Admin Tech Workshop",
    #     "description": "Internal tech training session",
    #     "date": "2024-12-20",
    #     "time": "10:00",
    #     "location": "Conference Room A",
    #     "organizer": "IT Department",
    #     "max_participants": 25
    # }

    # result = event_admin.EventCreation(new_event)
    # print(f"Result: {result}\n")

    # # Get all events
    # print("Fetching all events...")
    # events = event_admin.get_all_events(limit=5)
    # print(f"Found {len(events) if isinstance(events, list) else 0} events\n")

    # # Get dashboard stats
    # print("Dashboard stats...")
    # stats = event_admin.get_event_stats()
    # print(f"Stats: {stats}")
