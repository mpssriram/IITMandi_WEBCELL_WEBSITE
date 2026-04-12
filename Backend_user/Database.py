from pathlib import Path

import mysql.connector
from mysql.connector import Error as MySQLError

from .config import Config


class DatabaseError(Exception):
    """Raised for database setup or query errors."""


class TextError(Exception):
    """Backward-compatible custom exception."""


class Database:
    USER_SELECT_FIELDS = """
        id, firebase_uid, name, email, roll_number, role, active, created_at, updated_at
    """

    def __init__(self, config: Config | None = None):
        self.config = config or Config()
        self.connection = None

    def _connect(self, include_database: bool = True):
        connect_kwargs = {
            "host": self.config.DB_HOST,
            "port": int(self.config.DB_PORT),
            "user": self.config.DB_USER,
            "password": self.config.DB_PASSWORD,
        }

        if include_database:
            connect_kwargs["database"] = self.config.DB_NAME

        self.connection = mysql.connector.connect(**connect_kwargs)

    def _ensure_connection(self):
        if self.connection is None or not self.connection.is_connected():
            self._connect(include_database=True)

    def get_cursor(self, dictionary: bool = True):
        self._ensure_connection()
        return self.connection.cursor(dictionary=dictionary)

    def commit(self):
        if self.connection and self.connection.is_connected():
            self.connection.commit()

    def rollback(self):
        if self.connection and self.connection.is_connected():
            self.connection.rollback()

    def close(self):
        if self.connection and self.connection.is_connected():
            self.connection.close()
            self.connection = None

    def ensure_core_schema(self):
        schema_path = Path(__file__).resolve().parent.parent / "Backend" / "schema.sql"
        seed_path = Path(__file__).resolve().parent.parent / "Backend" / "seed_data.sql"

        if not schema_path.exists():
            raise DatabaseError(f"Schema file not found: {schema_path}")

        bootstrap = None
        bootstrap_cursor = None

        try:
            bootstrap = mysql.connector.connect(
                host=self.config.DB_HOST,
                port=int(self.config.DB_PORT),
                user=self.config.DB_USER,
                password=self.config.DB_PASSWORD,
            )
            bootstrap_cursor = bootstrap.cursor()
            bootstrap_cursor.execute(
                f"CREATE DATABASE IF NOT EXISTS `{self.config.DB_NAME}` "
                "CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"
            )
            bootstrap.commit()
        except MySQLError as exc:
            raise DatabaseError(f"Failed to bootstrap database: {exc}") from exc
        finally:
            if bootstrap_cursor:
                bootstrap_cursor.close()
            if bootstrap and bootstrap.is_connected():
                bootstrap.close()

        try:
            self._connect(include_database=True)
            cursor = self.connection.cursor(dictionary=False)

            cursor.execute(
                """
                CREATE TABLE IF NOT EXISTS users (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    firebase_uid VARCHAR(255) UNIQUE NULL,
                    name VARCHAR(255) NOT NULL,
                    email VARCHAR(255) UNIQUE NULL,
                    roll_number VARCHAR(50) UNIQUE NULL,
                    password VARCHAR(255) NOT NULL,
                    role VARCHAR(50) NOT NULL DEFAULT 'user',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                )
                """
            )

            statements = [
                statement.strip()
                for statement in schema_path.read_text(encoding="utf-8").split(";")
                if statement.strip()
            ]
            for statement in statements:
                cursor.execute(statement)

            try:
                cursor.execute("ALTER TABLE users ADD COLUMN firebase_uid VARCHAR(255) UNIQUE NULL")
            except MySQLError as exc:
                # Ignore if the column already exists.
                if getattr(exc, "errno", None) != 1060:
                    raise

            self.connection.commit()

            if seed_path.exists():
                seed_statements = [
                    statement.strip()
                    for statement in seed_path.read_text(encoding="utf-8").split(";")
                    if statement.strip()
                ]
                for statement in seed_statements:
                    cursor.execute(statement)
                self.connection.commit()
        except MySQLError as exc:
            raise DatabaseError(f"Failed to apply schema: {exc}") from exc
        finally:
            if "cursor" in locals() and cursor:
                cursor.close()
            self.close()

    def _fetch_user_by_field(self, cursor, field_name: str, value):
        cursor.execute(
            f"""
            SELECT {self.USER_SELECT_FIELDS}
            FROM users
            WHERE {field_name} = %s
            """,
            (value,),
        )
        return cursor.fetchone()

    def resolve_firebase_user(self, firebase_user: dict, create_if_missing: bool = True):
        cursor = None
        try:
            firebase_uid = (
                firebase_user.get("uid")
                or firebase_user.get("user_id")
                or firebase_user.get("sub")
            )
            email = firebase_user.get("email")
            name = (
                firebase_user.get("name")
                or firebase_user.get("display_name")
                or email
                or "Firebase User"
            )

            if not firebase_uid:
                raise DatabaseError("Firebase identity is missing uid after token verification.")

            cursor = self.get_cursor()
            local_user = self._fetch_user_by_field(cursor, "firebase_uid", firebase_uid)

            if not local_user and email:
                local_user = self._fetch_user_by_field(cursor, "email", email)
                if local_user:
                    cursor.execute(
                        """
                        UPDATE users
                        SET firebase_uid = %s,
                            name = %s,
                            email = %s
                        WHERE id = %s
                        """,
                        (firebase_uid, name, email, local_user["id"]),
                    )
                    self.commit()
                    local_user = self._fetch_user_by_field(cursor, "id", local_user["id"])

            if not local_user and create_if_missing:
                cursor.execute(
                    """
                    INSERT INTO users (firebase_uid, name, email, roll_number, password, role)
                    VALUES (%s, %s, %s, %s, %s, %s)
                    """,
                    (firebase_uid, name, email, None, "firebase_auth", "user"),
                )
                self.commit()
                local_user = self._fetch_user_by_field(cursor, "id", cursor.lastrowid)

            if local_user and (
                local_user.get("name") != name
                or local_user.get("email") != email
                or local_user.get("firebase_uid") != firebase_uid
            ):
                cursor.execute(
                    """
                    UPDATE users
                    SET firebase_uid = %s,
                        name = %s,
                        email = %s
                    WHERE id = %s
                    """,
                    (firebase_uid, name, email, local_user["id"]),
                )
                self.commit()
                local_user = self._fetch_user_by_field(cursor, "id", local_user["id"])

            return local_user
        except MySQLError as exc:
            self.rollback()
            raise DatabaseError(f"Failed to resolve Firebase user: {exc}") from exc
        finally:
            if cursor:
                cursor.close()
            self.close()

    def Eventaddition(self, event_data: dict):
        cursor = None
        try:
            cursor = self.get_cursor()
            cursor.execute(
                """
                INSERT INTO events (title, description, date, time, location, organizer, max_participants)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
                """,
                (
                    event_data.get("title"),
                    event_data.get("description"),
                    event_data.get("date"),
                    event_data.get("time"),
                    event_data.get("location"),
                    event_data.get("organizer"),
                    event_data.get("max_participants"),
                ),
            )
            self.commit()
            return {"success": True, "event_id": cursor.lastrowid}
        except MySQLError as exc:
            self.rollback()
            return {"success": False, "error": f"Failed to create event: {exc}"}
        finally:
            if cursor:
                cursor.close()
            self.close()


__all__ = ["Database", "DatabaseError", "TextError"]
