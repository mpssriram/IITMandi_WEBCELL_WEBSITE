<<<<<<< Updated upstream
from Backend.Database import Database, DatabaseError, TextError
=======
<<<<<<< HEAD
from Backend.Database import Database as SharedDatabase, DatabaseError, TextError


class Database(SharedDatabase):
    def ensure_core_schema(self):
        cursor = None
        try:
            cursor = self.get_cursor(dictionary=False)
            statements = [
                """
                CREATE TABLE IF NOT EXISTS users (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    name VARCHAR(255) NOT NULL,
                    email VARCHAR(255) UNIQUE NULL,
                    roll_number VARCHAR(50) UNIQUE NULL,
                    password VARCHAR(255) NOT NULL,
                    role VARCHAR(50) NOT NULL DEFAULT 'user',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                )
                """,
                """
                CREATE TABLE IF NOT EXISTS events (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    title VARCHAR(255) NOT NULL,
                    description TEXT,
                    date DATE NOT NULL,
                    time TIME NOT NULL,
                    location VARCHAR(255) NOT NULL,
                    organizer VARCHAR(255) NOT NULL,
                    max_participants INT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
                """,
                """
                CREATE TABLE IF NOT EXISTS resources (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    title VARCHAR(255) NOT NULL,
                    description TEXT NULL,
                    type VARCHAR(50) NOT NULL,
                    url TEXT NOT NULL,
                    category VARCHAR(255) NULL,
                    uploaded_by VARCHAR(255) NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
                """,
                """
                CREATE TABLE IF NOT EXISTS Team (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    name VARCHAR(255) NOT NULL,
                    roll_no VARCHAR(50) UNIQUE NOT NULL,
                    url TEXT NULL,
                    role VARCHAR(100) NOT NULL
                )
                """,
                """
                CREATE TABLE IF NOT EXISTS event_registrations (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    event_id INT NOT NULL,
                    user_uid VARCHAR(255) NULL,
                    user_id INT NULL,
                    user_name VARCHAR(255) NULL,
                    user_email VARCHAR(255) NULL,
                    user_roll_number VARCHAR(50) NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
                """,
                """
                CREATE TABLE IF NOT EXISTS projects (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    user_id INT NOT NULL,
                    title VARCHAR(255) NOT NULL,
                    description TEXT NOT NULL,
                    github_link TEXT NULL,
                    tech_stack TEXT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                )
                """,
                """
                CREATE TABLE IF NOT EXISTS notifications (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    user_id INT NULL,
                    title VARCHAR(255) NOT NULL,
                    message TEXT NOT NULL,
                    type VARCHAR(50) NOT NULL DEFAULT 'info',
                    is_read BOOLEAN NOT NULL DEFAULT 0,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
                """,
            ]
            for statement in statements:
                cursor.execute(statement)
            self.commit()
        finally:
            if cursor:
                cursor.close()

=======
from Backend.Database import Database, DatabaseError, TextError
>>>>>>> 2f2962dab9d3219bb71e3a0d704e4ebffc7295f2
>>>>>>> Stashed changes

__all__ = ["Database", "DatabaseError", "TextError"]
