FROM python:3.12-slim AS builder

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR /build

COPY Backend_user/requirements.txt Backend_user/requirements.txt

RUN python -m venv /opt/venv \
    && /opt/venv/bin/pip install --upgrade pip \
    && /opt/venv/bin/pip wheel --wheel-dir /wheels -r Backend_user/requirements.txt


FROM python:3.12-slim AS runtime

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PYTHONPATH=/app \
    PATH="/opt/venv/bin:$PATH"

WORKDIR /app

RUN addgroup --system appgroup \
    && adduser --system --ingroup appgroup --home /app appuser \
    && python -m venv /opt/venv

COPY --from=builder /wheels /wheels

RUN /opt/venv/bin/pip install --upgrade pip \
    && /opt/venv/bin/pip install --no-cache-dir /wheels/*

COPY Backend /app/Backend
COPY Backend_user /app/Backend_user

RUN mkdir -p /app/uploads /app/resources \
    && chmod +x /app/Backend_user/docker/start-backend.sh \
    && chown -R appuser:appgroup /app /opt/venv

USER appuser

EXPOSE 8765

CMD ["/app/Backend_user/docker/start-backend.sh"]
