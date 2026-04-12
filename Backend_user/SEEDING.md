# Database Seeding (Backend_user)

This project now uses a real backend seeding command for the active MySQL schema.

## Run

From the repo root:

```powershell
py -3 -m Backend_user.seed_db --mode reset
```

## Behavior

- `reset` mode is implemented.
- It truncates seed-managed tables, then inserts realistic IIT Mandi/Dev Cell demo data.
- Relationships are preserved (for example, `event_registrations.event_id` always points to real `events.id`).
- `website_events.id` is aligned with `events.id` so user registration views remain populated consistently.

## Seeded Entities

- `users`
- `events`
- `event_registrations`
- `resources`
- `Team`
- `team_members`
- `projects`
- `former_leads`
- `website_events`
- `join_applications`
- `announcements`

## Prerequisites

- Valid MySQL config in `Backend/config.yaml` (used by `Backend_user.config.Config`).
- MySQL server reachable with configured credentials.
