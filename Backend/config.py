import json
import yaml
from pathlib import Path


class Config:
    def __init__(self, config_path="config.yaml"):
        config_file = Path(config_path)
        if not config_file.is_absolute():
            config_file = Path(__file__).resolve().parent / config_file

        self.config_path = config_file
        self._data = self._load_yaml()

        # ---- Web ----
        self.APP_NAME = self._get("app.name")
        self.DEBUG = self._get("app.debug", False)
        self.UPLOAD_FOLDER = self._get("app.upload_folder", "uploads")

        # ---- Server ----
        self.HOST = self._get("server.host", "127.0.0.1")
        self.PORT = self._get("server.port", 5000)

        # ---- Database ----
        self.DB_TYPE = self._get("database.type")
        self.DB_HOST = self._get("database.host", "localhost")
        self.DB_PORT = self._get("database.port", 3306)
        self.DB_USER = self._get("database.user")
        self.DB_PASSWORD = self._get("database.password")
        self.DB_NAME = self._get("database.database")

        # ---- Firebase ----
        self.FIREBASE_SERVICE_ACCOUNT_PATH = self._resolve_path(
            self._get("firebase.service_account_path")
        )
        self.FIREBASE_STORAGE_BUCKET = self._get("firebase.storage_bucket")
        self.FIREBASE_CONFIG_JSON = self._load_json_file(self.FIREBASE_SERVICE_ACCOUNT_PATH)
        self.FIREBASE_WEB_CONFIG = self.FIREBASE_CONFIG_JSON.get("firebaseConfig", {})

        # ---- CORS ----
        self.CORS_ALLOWED_ORIGINS = self._get("cors.allowed_origins", [])

    # ---------------------
    # Internal helpers
    # ---------------------
    def _load_yaml(self):
        if not self.config_path.exists():
            raise FileNotFoundError(f"Config file not found: {self.config_path}")

        with self.config_path.open("r") as f:
            return yaml.safe_load(f) or {}

    def _get(self, dotted_key, default=None):
        """
        Access nested keys using dot notation
        Example: app.debug
        """
        keys = dotted_key.split(".")
        value = self._data

        for k in keys:
            if not isinstance(value, dict) or k not in value:
                return default
            value = value[k]

        return value

    def _resolve_path(self, file_path):
        if not file_path:
            return None

        path = Path(file_path)
        if not path.is_absolute():
            path = self.config_path.parent / path

        return path

    def _load_json_file(self, file_path):
        if not file_path:
            return {}

        if not file_path.exists():
            return {}

        with file_path.open("r", encoding="utf-8") as f:
            return json.load(f)

    def as_dict(self):
        return self._data

if __name__ == "__main__":
    cfg = Config()
    print("Loaded config OK")
    print(cfg.as_dict())
    print(cfg.PORT)
