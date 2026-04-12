from fastapi import HTTPException, status

from ..Database import Database, DatabaseError


class UserService:
    def __init__(self):
        self.db = Database()

    def _close_cursor(self, cursor):
        if cursor:
            cursor.close()

    def _close_db(self):
        try:
            self.db.close()
        except Exception:
            pass

    def resolve_local_user(self, firebase_user: dict):
        try:
            local_user = self.db.resolve_firebase_user(firebase_user, create_if_missing=True)
            if not local_user:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Authenticated user is not mapped in the local database.",
                )
            return local_user
        except HTTPException:
            raise
        except DatabaseError as exc:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=str(exc),
            ) from exc

    def get_profile(self, firebase_user):
        return self.resolve_local_user(firebase_user)

    def update_profile(self, firebase_user, payload):
        cursor = None
        try:
            local_user = self.resolve_local_user(firebase_user)
            update_data = payload.model_dump(exclude_unset=True)

            if "email" in update_data:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Email is managed by Firebase and cannot be updated here.",
                )

            cursor = self.db.get_cursor()

            if "roll_number" in update_data and update_data["roll_number"]:
                cursor.execute(
                    "SELECT id FROM users WHERE roll_number = %s AND id != %s",
                    (update_data["roll_number"], local_user["id"]),
                )
                if cursor.fetchone():
                    raise HTTPException(
                        status_code=status.HTTP_409_CONFLICT,
                        detail="Roll number is already in use.",
                    )

            fields = []
            values = []
            for field in ["name", "roll_number"]:
                if field in update_data:
                    fields.append(f"{field} = %s")
                    values.append(update_data[field])

            if not fields:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="No valid fields to update.",
                )

            values.append(local_user["id"])
            cursor.execute(
                f"UPDATE users SET {', '.join(fields)} WHERE id = %s",
                tuple(values),
            )
            self.db.commit()
            cursor.execute(
                """
                SELECT id, firebase_uid, name, email, roll_number, role, created_at, updated_at
                FROM users
                WHERE id = %s
                """,
                (local_user["id"],),
            )
            return cursor.fetchone()
        except HTTPException:
            self.db.rollback()
            raise
        except Exception as exc:
            self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to update profile: {exc}",
            ) from exc
        finally:
            self._close_cursor(cursor)
            self._close_db()

    def list_public_projects(self, limit=20, offset=0):
        cursor = None
        try:
            cursor = self.db.get_cursor()
            cursor.execute(
                """
                SELECT
                    id,
                    title,
                    short_description,
                    full_description,
                    tech_stack,
                    github_url,
                    live_url,
                    image_url,
                    status,
                    current_lead,
                    former_leads,
                    contributors,
                    featured,
                    display_order
                FROM projects
                ORDER BY featured DESC, display_order ASC, id DESC
                LIMIT %s OFFSET %s
                """,
                (limit, offset),
            )
            items = cursor.fetchall() or []
            return {"success": True, "items": items, "count": len(items)}
        finally:
            self._close_cursor(cursor)
            self._close_db()

    def list_public_team(self, limit=100, offset=0):
        cursor = None
        try:
            cursor = self.db.get_cursor()
            cursor.execute(
                """
                SELECT
                    id,
                    full_name,
                    role,
                    team_domain,
                    year,
                    bio,
                    skills,
                    photo_url,
                    linkedin_url,
                    github_url,
                    email,
                    active,
                    display_order
                FROM team_members
                WHERE active = 1
                ORDER BY display_order ASC, id DESC
                LIMIT %s OFFSET %s
                """,
                (limit, offset),
            )
            items = cursor.fetchall() or []
            return {"success": True, "items": items, "count": len(items)}
        finally:
            self._close_cursor(cursor)
            self._close_db()

    def list_public_former_leads(self, limit=50, offset=0):
        cursor = None
        try:
            cursor = self.db.get_cursor()
            cursor.execute(
                """
                SELECT
                    id,
                    full_name,
                    role_title,
                    DATE_FORMAT(tenure_start, '%Y-%m-%d') AS tenure_start,
                    DATE_FORMAT(tenure_end, '%Y-%m-%d') AS tenure_end,
                    handled_projects,
                    linkedin_url,
                    github_url,
                    photo_url,
                    short_note,
                    visible_on_site
                FROM former_leads
                WHERE visible_on_site = 1
                ORDER BY tenure_end DESC, id DESC
                LIMIT %s OFFSET %s
                """,
                (limit, offset),
            )
            items = cursor.fetchall() or []
            return {"success": True, "items": items, "count": len(items)}
        finally:
            self._close_cursor(cursor)
            self._close_db()

    def list_public_events(
        self,
        limit=20,
        offset=0,
        search_title=None,
        search_organizer=None,
        search_location=None,
    ):
        cursor = None
        try:
            cursor = self.db.get_cursor()
            conditions = []
            values = []

            if search_title:
                conditions.append("title LIKE %s")
                values.append(f"%{str(search_title).strip()}%")

            if search_organizer:
                conditions.append("(organizers LIKE %s OR speakers LIKE %s)")
                organizer_value = f"%{str(search_organizer).strip()}%"
                values.extend([organizer_value, organizer_value])

            if search_location:
                conditions.append("venue LIKE %s")
                values.append(f"%{str(search_location).strip()}%")

            where_clause = ""
            if conditions:
                where_clause = f"WHERE {' AND '.join(conditions)}"

            cursor.execute(
                f"""
                SELECT
                    id,
                    title,
                    type,
                    description,
                    DATE_FORMAT(date, '%Y-%m-%d') AS date,
                    venue,
                    registration_link,
                    poster_image_url,
                    speakers,
                    organizers,
                    status,
                    featured
                FROM website_events
                {where_clause}
                ORDER BY featured DESC, date DESC, id DESC
                LIMIT %s OFFSET %s
                """,
                (*values, limit, offset),
            )
            items = cursor.fetchall() or []
            return {"success": True, "items": items, "count": len(items)}
        finally:
            self._close_cursor(cursor)
            self._close_db()

    def get_public_event(self, event_id):
        cursor = None
        try:
            cursor = self.db.get_cursor()
            cursor.execute(
                """
                SELECT
                    id,
                    title,
                    type,
                    description,
                    DATE_FORMAT(date, '%Y-%m-%d') AS date,
                    venue,
                    registration_link,
                    poster_image_url,
                    speakers,
                    organizers,
                    status,
                    featured
                FROM website_events
                WHERE id = %s
                """,
                (event_id,),
            )
            event = cursor.fetchone()
            if not event:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Event not found.",
                )
            return event
        finally:
            self._close_cursor(cursor)
            self._close_db()

    def list_public_resources(
        self,
        limit=20,
        offset=0,
        search_title=None,
        search_category=None,
        search_uploaded_by=None,
        search_type=None,
    ):
        cursor = None
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

            if search_type:
                conditions.append("LOWER(type) = %s")
                values.append(str(search_type).strip().lower())

            where_clause = ""
            if conditions:
                where_clause = f"WHERE {' AND '.join(conditions)}"

            cursor.execute(
                f"""
                SELECT
                    id,
                    title,
                    description,
                    type,
                    url,
                    category,
                    uploaded_by,
                    created_at
                FROM resources
                {where_clause}
                ORDER BY created_at DESC
                LIMIT %s OFFSET %s
                """,
                (*values, limit, offset),
            )
            items = cursor.fetchall() or []
            return {"success": True, "items": items, "count": len(items)}
        finally:
            self._close_cursor(cursor)
            self._close_db()

    def get_public_resource(self, resource_id):
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
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Resource not found.",
                )
            return resource
        finally:
            self._close_cursor(cursor)
            self._close_db()

    def list_public_members(self, limit=50, offset=0):
        cursor = None
        try:
            cursor = self.db.get_cursor()
            cursor.execute(
                """
                SELECT id, name, roll_no, url, role
                FROM Team
                ORDER BY id DESC
                LIMIT %s OFFSET %s
                """,
                (limit, offset),
            )
            items = cursor.fetchall() or []
            return {"success": True, "items": items, "count": len(items)}
        finally:
            self._close_cursor(cursor)
            self._close_db()

    def register_for_event(self, event_id, firebase_user):
        cursor = None
        try:
            local_user = self.resolve_local_user(firebase_user)
            cursor = self.db.get_cursor()
            cursor.execute("SELECT id FROM events WHERE id = %s", (event_id,))
            if not cursor.fetchone():
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Event not found.",
                )

            cursor.execute(
                """
                SELECT id FROM event_registrations
                WHERE event_id = %s
                  AND (
                    (email IS NOT NULL AND email = %s)
                    OR (roll_no IS NOT NULL AND roll_no = %s)
                    OR notes = %s
                  )
                """,
                (
                    event_id,
                    local_user.get("email"),
                    local_user.get("roll_number"),
                    f"registered_via_firebase_uid={firebase_user.get('uid')}",
                ),
            )
            if cursor.fetchone():
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="You are already registered for this event.",
                )

            cursor.execute(
                """
                INSERT INTO event_registrations (
                    event_id, full_name, email, roll_no, branch, year_of_study, phone, notes
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                """,
                (
                    event_id,
                    local_user.get("name"),
                    local_user.get("email"),
                    local_user.get("roll_number"),
                    None,
                    None,
                    None,
                    f"registered_via_firebase_uid={firebase_user.get('uid')}",
                ),
            )
            self.db.commit()
            return {
                "success": True,
                "message": "Event registration successful",
                "event_id": event_id,
                "user_id": local_user["id"],
            }
        except HTTPException:
            self.db.rollback()
            raise
        except Exception as exc:
            self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to register for event: {exc}",
            ) from exc
        finally:
            self._close_cursor(cursor)
            self._close_db()

    def list_my_registrations(self, firebase_user, limit=20, offset=0):
        cursor = None
        try:
            local_user = self.resolve_local_user(firebase_user)
            cursor = self.db.get_cursor()
            
            cursor.execute(
                """
                SELECT 
                    er.event_id AS id,
                    COALESCE(we.title, ev.title) AS title,
                    COALESCE(we.type, 'event') AS type,
                    COALESCE(we.description, ev.description) AS description,
                    COALESCE(
                        DATE_FORMAT(we.date, '%Y-%m-%d'),
                        DATE_FORMAT(ev.date, '%Y-%m-%d')
                    ) AS date,
                    COALESCE(we.venue, ev.location) AS venue,
                    we.poster_image_url
                FROM event_registrations er
                LEFT JOIN website_events we ON er.event_id = we.id
                LEFT JOIN events ev ON er.event_id = ev.id
                WHERE (er.email = %s OR er.roll_no = %s OR er.notes = %s)
                ORDER BY COALESCE(we.date, ev.date) DESC, er.created_at DESC
                LIMIT %s OFFSET %s
                """,
                (
                    local_user.get("email"),
                    local_user.get("roll_number"),
                    f"registered_via_firebase_uid={firebase_user.get('uid')}",
                    limit, offset
                )
            )
            items = cursor.fetchall() or []
            return {"success": True, "items": items, "count": len(items)}
        finally:
            self._close_cursor(cursor)
            self._close_db()

    def submit_join_application(self, payload):
        cursor = None
        try:
            cursor = self.db.get_cursor()
            cursor.execute(
                """
                INSERT INTO join_applications (name, email, year, interest, message, created_at)
                VALUES (%s, %s, %s, %s, %s, NOW())
                """,
                (payload.name, payload.email, payload.year, payload.interest, payload.message),
            )
            self.db.commit()
            return {
                "success": True,
                "message": "Application submitted successfully",
                "application_id": cursor.lastrowid,
            }
        except Exception as exc:
            self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to submit application: {exc}",
            ) from exc
        finally:
            self._close_cursor(cursor)
            self._close_db()
