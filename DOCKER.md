# Production Docker Setup

This repository now includes a production-oriented container stack for:

- `web`: built React/Vite frontend served by nginx
- `backend`: FastAPI app served by gunicorn with uvicorn workers
- `db`: MySQL 8 with a named volume

## Files Added

- `compose.yaml`
- `.dockerignore`
- `.env.docker.example`
- `Backend/config.yaml.example`
- `Backend_user/Dockerfile`
- `Backend_user/docker/start-backend.sh`
- `Backend_user/docker/wait_for_db.py`
- `Backend_user/docker/healthcheck.py`
- `frontend/Dockerfile`
- `frontend/.dockerignore`
- `frontend/nginx/default.conf`

## Files Updated

- `Backend/config.py`
- `Backend_user/requirements.txt`
- `frontend/src/lib/api.ts`
- `frontend/.env.example`

## Stack Layout

- Browser -> `web` on `http://localhost:8080`
- `web` nginx -> reverse proxies `/api/*` to `backend:8765`
- `backend` -> connects to MySQL at `db:3306`
- MySQL data persists in the `mysql_data` named volume

## Runtime Strategy

### Frontend

- Multi-stage build in `frontend/Dockerfile`
- Built with `npm run build`
- Served by nginx, not the Vite dev server
- Uses same-origin `/api` in production so no localhost API assumption remains
- SPA fallback and API proxying live in `frontend/nginx/default.conf`

### Backend

- Multi-stage build in `Backend_user/Dockerfile`
- Starts with gunicorn + `uvicorn.workers.UvicornWorker`
- Waits for MySQL before boot via `Backend_user/docker/wait_for_db.py`
- Healthcheck uses `Backend_user/docker/healthcheck.py`
- Runs as non-root inside the container

## Required Setup

1. Copy the Docker env template:

```powershell
Copy-Item .env.docker.example .env.docker
```

2. Provide a Firebase Admin SDK file on the host at the path referenced by `FIREBASE_SERVICE_ACCOUNT_HOST_PATH` in `.env.docker`.

By default that path is:

- `./Backend/firebase-adminsdk.json`

Authenticated backend endpoints depend on this file.

## Environment Variables

Defined in `.env.docker`:

- `WEB_PORT`
- `MYSQL_DATABASE`
- `MYSQL_USER`
- `MYSQL_PASSWORD`
- `MYSQL_ROOT_PASSWORD`
- `CORS_ALLOWED_ORIGINS`
- `FIREBASE_SERVICE_ACCOUNT_HOST_PATH`
- `FIREBASE_STORAGE_BUCKET`
- `FIREBASE_PROJECT_ID`
- `ADMIN_EMAILS`
- `ADMIN_UIDS`
- `GUNICORN_WORKERS`
- `GUNICORN_TIMEOUT`
- `GUNICORN_GRACEFUL_TIMEOUT`
- `GUNICORN_KEEPALIVE`
- `DB_WAIT_TIMEOUT`
- `DB_WAIT_INTERVAL`
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

## Ports

- Host -> `web`: `8080` by default
- Internal `web`: `8080`
- Internal `backend`: `8765`
- Internal `db`: `3306`

Only the web container is published to the host by default.

## Build and Run

```powershell
docker compose --env-file .env.docker up --build -d
```

To stop:

```powershell
docker compose --env-file .env.docker down
```

To stop and remove the MySQL volume too:

```powershell
docker compose --env-file .env.docker down -v
```

## Health Checks

- `db`: `mysqladmin ping`
- `backend`: `GET http://127.0.0.1:8765/health`
- `web`: `GET http://127.0.0.1:8080/healthz`

## Database Initialization

Database initialization is automatic.

The backend runs `Database.ensure_core_schema()` during startup, which:

- creates the configured MySQL database if it does not exist
- creates the active tables from `Backend/schema.sql`
- ensures runtime-required tables like `users` and `announcements` exist

No separate migration container is used in this setup because the application already owns schema bootstrap.

## Config Resolution

The backend now supports environment overrides for container use. It reads:

- `Backend/config.yaml` if present
- otherwise `Backend/config.yaml.example`
- then overlays container environment variables

That avoids hard-wiring local Windows paths inside containers.

## Production Notes

- Frontend API calls are same-origin via nginx `/api` proxying.
- Backend uses Docker service names, not `localhost`, for MySQL access.
- Firebase web config is supplied at frontend build time through Docker build args.
- Firebase Admin credentials are mounted at runtime and are not copied into the image.

## Remaining Hardening Suggestions

1. Put nginx behind TLS termination in your actual deployment environment.
2. Move Firebase Admin credentials to Docker secrets or your platform secret manager.
3. Add structured application logging and centralized log shipping.
4. Add a real migration system if schema evolution becomes more complex than bootstrap creation.
