import json
import os
from pathlib import Path

import yaml
from dotenv import load_dotenv


class Config:
    def __init__(self, config_path: str | None = None):
        load_dotenv(override=False)

        config_file = self._resolve_config_path(config_path or os.getenv("CONFIG_PATH") or "config.yaml")
        self.config_path = config_file
        self._data = self._load_yaml()

        # ---- Web ----
        self.APP_NAME = self._get_env("APP_NAME", "app.name", "Dev Website")
        self.DEBUG = self._get_bool("DEBUG", "app.debug", False)
        self.UPLOAD_FOLDER = self._resolve_path(
            self._get_env("UPLOAD_FOLDER", "app.upload_folder", "uploads")
        )

        # ---- Server ----
        self.HOST = self._get_env("HOST", "server.host", "127.0.0.1")
        self.PORT = self._get_int("PORT", "server.port", 5000)

        # ---- Database ----
        self.DB_TYPE = self._get_env("DB_TYPE", "database.type", "mysql")
        self.DB_HOST = self._get_env("DB_HOST", "database.host", "localhost")
        self.DB_PORT = self._get_int("DB_PORT", "database.port", 3306)
        self.DB_USER = self._get_env("DB_USER", "database.user", "root")
        self.DB_PASSWORD = self._get_env("DB_PASSWORD", "database.password", "")
        self.DB_NAME = self._get_env("DB_NAME", "database.database", "DevCell")

        # ---- Firebase ----
        self.FIREBASE_SERVICE_ACCOUNT_PATH = self._resolve_path(
            self._get_env("FIREBASE_SERVICE_ACCOUNT_PATH", "firebase.service_account_path")
        )
        self.FIREBASE_STORAGE_BUCKET = self._get_env(
            "FIREBASE_STORAGE_BUCKET", "firebase.storage_bucket", ""
        )
        self.FIREBASE_PROJECT_ID = self._get_env(
            "FIREBASE_PROJECT_ID", "firebase.project_id", ""
        )
        self.FIREBASE_CONFIG_JSON = self._load_json_file(self.FIREBASE_SERVICE_ACCOUNT_PATH)
        self.FIREBASE_WEB_CONFIG = self._build_firebase_web_config()

        # ---- Admin access ----
        self.ADMIN_EMAILS = self._get_string_list(
            "admin.emails",
            env_var="ADMIN_EMAILS",
            lowercase=True,
        )
        self.ADMIN_UIDS = self._get_string_list(
            "admin.uids",
            env_var="ADMIN_UIDS",
            lowercase=False,
        )

        # ---- CORS ----
        self.CORS_ALLOWED_ORIGINS = self._get_string_list(
            "cors.allowed_origins",
            env_var="CORS_ALLOWED_ORIGINS",
        )

    def _resolve_config_path(self, config_path: str) -> Path:
        path = Path(config_path)
        if not path.is_absolute():
            path = Path(__file__).resolve().parent / path

        if path.exists():
            return path

        example_path = path.with_name(f"{path.name}.example")
        if example_path.exists():
            return example_path

        raise FileNotFoundError(f"Config file not found: {path}")

    def _load_yaml(self):
        with self.config_path.open("r", encoding="utf-8") as file_obj:
            return yaml.safe_load(file_obj) or {}

    def _get(self, dotted_key, default=None):
        keys = dotted_key.split(".")
        value = self._data

        for key in keys:
            if not isinstance(value, dict) or key not in value:
                return default
            value = value[key]

        return value

    def _get_env(self, env_var: str, dotted_key: str, default=None):
        env_value = os.getenv(env_var)
        if env_value is not None and env_value != "":
            return env_value
        return self._get(dotted_key, default)

    def _get_bool(self, env_var: str, dotted_key: str, default: bool) -> bool:
        env_value = os.getenv(env_var)
        if env_value is not None and env_value != "":
            return env_value.strip().lower() in {"1", "true", "yes", "on"}
        return bool(self._get(dotted_key, default))

    def _get_int(self, env_var: str, dotted_key: str, default: int) -> int:
        env_value = os.getenv(env_var)
        if env_value is not None and env_value != "":
            return int(env_value)
        return int(self._get(dotted_key, default))

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

        with file_path.open("r", encoding="utf-8") as file_obj:
            return json.load(file_obj)

    def _get_string_list(self, dotted_key, default=None, env_var=None, lowercase=False):
        if env_var:
            env_value = os.getenv(env_var)
            if env_value:
                values = [item.strip() for item in env_value.split(",") if item.strip()]
                return [value.lower() for value in values] if lowercase else values

        raw_value = self._get(dotted_key, default or [])
        if raw_value is None:
            return []

        if isinstance(raw_value, str):
            values = [item.strip() for item in raw_value.split(",") if item.strip()]
        elif isinstance(raw_value, list):
            values = [str(item).strip() for item in raw_value if str(item).strip()]
        else:
            return []

        return [value.lower() for value in values] if lowercase else values

    def _build_firebase_web_config(self):
        file_payload = self.FIREBASE_CONFIG_JSON or {}
        web_config = dict(file_payload.get("firebaseConfig", {}))

        if not web_config and file_payload.get("project_id"):
            web_config["projectId"] = file_payload.get("project_id")

        if self.FIREBASE_PROJECT_ID:
            web_config["projectId"] = self.FIREBASE_PROJECT_ID

        return web_config

    def as_dict(self):
        return self._data


if __name__ == "__main__":
    cfg = Config()
    print("Loaded config OK")
    print(cfg.as_dict())
    print(cfg.PORT)
