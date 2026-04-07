import mysql.connector
from mysql.connector import Error

from config import Config


class DatabaseError(Exception):
    """Custom exception for database failures."""


class Database:
    """
    Simple reusable MySQL connection class.

    This class only handles database connection work so it can be reused
    later inside repositories and services.
    """

    def __init__(self, config: Config | None = None):
        self.config = config or Config()

        # Read database settings from config.py / config.yaml
        self.host = self.config._get("database.host", "localhost")
        self.port = self.config._get("database.port", 3306)
        self.user = self.config._get("database.user", "root")
        self.password = self.config._get("database.password", "")
        self.database = self.config._get("database.database", "")

        # Keep one active connection and reuse it when possible
        self.connection = None

    # -------------------------
    # Internal: connection helper
    # -------------------------
    def _connect(self):
        """
        Create a connection only if one does not already exist.
        """
        try:
            if self.connection and self.connection.is_connected():
                return self.connection

            self.connection = mysql.connector.connect(
                host=self.host,
                port=self.port,
                user=self.user,
                password=self.password,
                database=self.database,
            )
            return self.connection
        except Error as exc:
            self.connection = None
            raise DatabaseError(f"Failed to connect to MySQL: {exc}") from exc

    def connect(self):
        """Public method to open or reuse the database connection."""
        return self._connect()

    def get_connection(self):
        """Return the active MySQL connection."""
        return self._connect()

    def get_cursor(self, dictionary=True):
        """
        Return a cursor from the active connection.

        dictionary=True is useful for FastAPI because rows come back as:
        {"id": 1, "name": "Dev Cell"}
        """
        try:
            conn = self._connect()
            return conn.cursor(dictionary=dictionary)
        except Error as exc:
            raise DatabaseError(f"Failed to create cursor: {exc}") from exc

    def commit(self):
        """Commit the current database transaction."""
        try:
            if self.connection and self.connection.is_connected():
                self.connection.commit()
        except Error as exc:
            raise DatabaseError(f"Failed to commit transaction: {exc}") from exc

    def rollback(self):
        """Rollback the current transaction if an error happens."""
        try:
            if self.connection and self.connection.is_connected():
                self.connection.rollback()
        except Error as exc:
            raise DatabaseError(f"Failed to rollback transaction: {exc}") from exc

    def close(self):
        """Close the current database connection safely."""
        try:
            if self.connection and self.connection.is_connected():
                self.connection.close()
        except Error as exc:
            raise DatabaseError(f"Failed to close database connection: {exc}") from exc
        finally:
            self.connection = None

    def test_connection(self):
        """
        Simple helper to test whether the database connection is working.

        Returns:
            dict: Result from MySQL with the current server time.
        """
        cursor = None

        try:
            cursor = self.get_cursor()
            cursor.execute("SELECT NOW() AS server_time")
            result = cursor.fetchone()
            return result
        except Exception:
            self.rollback()
            raise
        finally:
            if cursor is not None:
                cursor.close()
            self.close()


if __name__ == "__main__":
    db = Database()
    print(db.test_connection())
