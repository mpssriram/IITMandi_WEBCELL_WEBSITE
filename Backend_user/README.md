# Backend_user

FastAPI backend for IIT Mandi Web Cell website.

## Run locally

1. Install Python dependencies:

```bash
pip install -r Backend_user/requirements.txt
```

2. Create local config from examples:

- Copy Backend_user/config.yaml.example to Backend_user/config.yaml and fill values.
- Copy Backend_user/.env.example to Backend_user/.env if you prefer env variables.

3. Ensure the Firebase Admin file exists:

- Backend_user/firebase-adminsdk.json

4. Start backend from repo root:

```bash
uvicorn Backend_user.main:app --reload --host 127.0.0.1 --port 5000
```

## Important endpoints

- GET /health
- GET /me
- POST /user/register
- POST /user/login
- GET /user/profile
- PUT /user/profile
- GET /user/team
- GET /user/projects
- GET /user/former-leads
- GET /user/events
- GET /user/resources
- POST /user/join
- GET /admin/dashboard/counts
