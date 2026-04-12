import sys
import time

import mysql.connector

from Backend_user.config import Config


def main() -> int:
    config = Config()
    timeout = int(sys.argv[1]) if len(sys.argv) > 1 else 90
    interval = float(sys.argv[2]) if len(sys.argv) > 2 else 2.0
    deadline = time.time() + timeout

    while time.time() < deadline:
        try:
            connection = mysql.connector.connect(
                host=config.DB_HOST,
                port=int(config.DB_PORT),
                user=config.DB_USER,
                password=config.DB_PASSWORD,
            )
            connection.close()
            print(f"MySQL is reachable at {config.DB_HOST}:{config.DB_PORT}")
            return 0
        except mysql.connector.Error as exc:
            print(f"Waiting for MySQL at {config.DB_HOST}:{config.DB_PORT}: {exc}")
            time.sleep(interval)

    print(f"MySQL did not become reachable within {timeout} seconds.", file=sys.stderr)
    return 1


if __name__ == "__main__":
    raise SystemExit(main())
