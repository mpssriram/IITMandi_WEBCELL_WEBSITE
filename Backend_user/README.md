# Backend_user

This backend is based on the latest admin-enabled FastAPI backend from the repo and reuses the same admin services and route structure.

## Features

- Firebase token based authentication
- Local user signup/login with email or IIT roll number
- Bcrypt password hashing for local users
- JWT authentication for local user routes
- Admin route protection
- Admin dashboard counts
- Event CRUD and registration counts
- Team member CRUD and stats
- Resource CRUD and stats
- User profile get and update
- Public event listing and event registration
- Public resource listing
- MySQL access through `mysql.connector`
- Local `config.yaml` support with `.env` fallback

## Structure

```text
Backend_user/
├── __init__.py
├── main.py
├── auth.py
├── config.py
├── Database.py
├── firebase_admin_setup.py
├── requirements.txt
├── .env.example
├── config.yaml.example
├── .gitignore
├── README.md
├── admin/
│   ├── __init__.py
│   ├── DashboardManagement.py
│   ├── Event_Registration.py
│   ├── ResourceManagement.py
│   ├── Teammanagement.py
│   └── routes.py
└── user/
    ├── __init__.py
    └── routes.py
```

## Setup

1. Create and activate a virtual environment.

```bash
python -m venv venv
venv\Scripts\activate
```

2. Install dependencies.

```bash
pip install -r Backend_user\requirements.txt
```

3. Create your local config.

Option A:
Copy `Backend_user\config.yaml.example` to `Backend_user\config.yaml` and fill in the real values.

Option B:
Copy `Backend_user\.env.example` to `Backend_user\.env` and fill in the values.

4. Add your Firebase Admin SDK JSON file at:

`Backend_user\firebase-adminsdk.json`

5. Run the backend from the repo root:

```bash
uvicorn Backend_user.main:app --reload --host 127.0.0.1 --port 5000
```

## Main Endpoints

- `GET /health`
- `GET /me`
- `POST /user/register`
- `POST /user/login`
- `GET /user/profile`
- `PUT /user/profile`
- `GET /user/events`
- `GET /user/events/{event_id}`
- `POST /user/events/{event_id}/register`
- `GET /user/resources`
- `GET /user/resources/{resource_id}`
- `GET /user/members`
- `GET /admin/dashboard/counts`
- `GET /admin/events`
- `POST /admin/events`
- `PATCH /admin/events/{event_id}`
- `DELETE /admin/events/{event_id}`
- `GET /admin/team-members`
- `POST /admin/team-members`
- `PATCH /admin/team-members/{member_id}`
- `DELETE /admin/team-members/{member_id}`
- `GET /admin/resources`
- `POST /admin/resources`
- `PATCH /admin/resources/{resource_id}`
- `DELETE /admin/resources/{resource_id}`

## Notes

- `config.yaml` is intentionally ignored, so secrets stay local.
- The startup hook creates the core MySQL tables if they do not already exist.
- Admin routes require a Firebase token whose decoded payload contains `admin=true` or `role=admin`.
- User routes use local JWT tokens returned by `/user/login` and `/user/register`.
