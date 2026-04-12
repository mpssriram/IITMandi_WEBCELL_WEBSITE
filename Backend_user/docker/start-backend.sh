#!/bin/sh
set -eu

python /app/Backend_user/docker/wait_for_db.py "${DB_WAIT_TIMEOUT:-90}" "${DB_WAIT_INTERVAL:-2}"

exec gunicorn \
  Backend_user.main:app \
  --worker-class uvicorn.workers.UvicornWorker \
  --workers "${GUNICORN_WORKERS:-2}" \
  --bind "0.0.0.0:${PORT:-8765}" \
  --access-logfile - \
  --error-logfile - \
  --timeout "${GUNICORN_TIMEOUT:-120}" \
  --graceful-timeout "${GUNICORN_GRACEFUL_TIMEOUT:-30}" \
  --keep-alive "${GUNICORN_KEEPALIVE:-5}"
