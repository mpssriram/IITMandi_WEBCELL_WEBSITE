from pathlib import Path

import mysql.connector
import yaml

def _read_schema_file(schema_path: Path) -> str:
    if not schema_path.exists():
        raise FileNotFoundError(f"Schema file not found: {schema_path}")
    return schema_path.read_text(encoding="utf-8")


def _read_db_config() -> dict:
    config_path = Path(__file__).resolve().parent / "config.yaml"
    if not config_path.exists():
        raise FileNotFoundError(f"Config file not found: {config_path}")

    with config_path.open("r", encoding="utf-8") as config_file:
        config_data = yaml.safe_load(config_file) or {}

    db_config = config_data.get("database", {})
    database_name = db_config.get("database")
    if not database_name:
        raise ValueError("database.database is missing in Backend/config.yaml")

    return {
        "host": db_config.get("host", "localhost"),
        "port": int(db_config.get("port", 3306)),
        "user": db_config.get("user", "root"),
        "password": db_config.get("password", ""),
        "database": database_name,
    }


def initialize_database() -> dict:
    db_config = _read_db_config()
    schema_path = Path(__file__).resolve().parent / "schema.sql"
    schema_sql = _read_schema_file(schema_path)

    bootstrap_conn = mysql.connector.connect(
        host=db_config["host"],
        port=db_config["port"],
        user=db_config["user"],
        password=db_config["password"],
    )

    try:
        bootstrap_cursor = bootstrap_conn.cursor()
        bootstrap_cursor.execute(
            f"CREATE DATABASE IF NOT EXISTS `{db_config['database']}` "
            "CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"
        )
        bootstrap_conn.commit()
    finally:
        bootstrap_cursor.close()
        bootstrap_conn.close()

    app_conn = mysql.connector.connect(
        host=db_config["host"],
        port=db_config["port"],
        user=db_config["user"],
        password=db_config["password"],
        database=db_config["database"],
    )

    executed_statements = 0
    try:
        cursor = app_conn.cursor()
        statements = [statement.strip() for statement in schema_sql.split(";") if statement.strip()]
        for statement in statements:
            cursor.execute(statement)
            executed_statements += 1
        app_conn.commit()
    finally:
        cursor.close()
        app_conn.close()

    return {
        "success": True,
        "database": db_config["database"],
        "schema_file": str(schema_path),
        "executed_statements": executed_statements,
    }


if __name__ == "__main__":
    result = initialize_database()
    print(result)