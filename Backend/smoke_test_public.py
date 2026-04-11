import json
import os
import sys
import time
from urllib import error, request


BASE_URL = os.getenv("BASE_URL", "http://localhost:5000")


def _http_json(path: str, method: str = "GET", payload: dict | None = None) -> tuple[int, dict | str]:
    body = None
    headers = {"Accept": "application/json"}

    if payload is not None:
        body = json.dumps(payload).encode("utf-8")
        headers["Content-Type"] = "application/json"

    req = request.Request(f"{BASE_URL}{path}", method=method, data=body, headers=headers)

    try:
        with request.urlopen(req, timeout=10) as resp:
            raw = resp.read().decode("utf-8")
            try:
                return resp.status, json.loads(raw)
            except json.JSONDecodeError:
                return resp.status, raw
    except error.HTTPError as exc:
        raw = exc.read().decode("utf-8") if exc.fp else ""
        try:
            return exc.code, json.loads(raw)
        except json.JSONDecodeError:
            return exc.code, raw


def main() -> int:
    checks = [
        ("/health", "GET", None, 200),
        ("/user/projects", "GET", None, 200),
        ("/user/team", "GET", None, 200),
        ("/user/former-leads", "GET", None, 200),
        ("/user/events", "GET", None, 200),
    ]

    failed = False

    for path, method, payload, expected_status in checks:
        status_code, data = _http_json(path, method=method, payload=payload)
        ok = status_code == expected_status
        failed = failed or (not ok)
        print(f"{path}: status={status_code} expected={expected_status} ok={ok}")
        if not ok:
            print(f"  response={data}")

    join_payload = {
        "name": "Smoke Test User",
        "email": f"smoke-{int(time.time())}@example.com",
        "year": "3rd Year",
        "interest": "Web Platform",
        "message": "Automated public API smoke test.",
    }
    join_status, join_data = _http_json("/user/join", method="POST", payload=join_payload)
    join_ok = join_status == 201 and isinstance(join_data, dict) and bool(join_data.get("application_id"))
    failed = failed or (not join_ok)
    print(f"/user/join: status={join_status} expected=201 ok={join_ok}")
    if not join_ok:
        print(f"  response={join_data}")

    if failed:
        print("Public API smoke test failed")
        return 1

    print("Public API smoke test passed")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
