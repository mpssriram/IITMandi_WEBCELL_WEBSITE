# Admin Scope Review (Against Required Scope Only)

## Required Scope Verdict

| Required item | Status | Frontend evidence | Backend evidence | End-to-end wired? | What is still missing |
|---|---|---|---|---|---|
| 1. User Management: view all users | Fully working | `frontend/src/pages/AdminUsersPage.tsx` (`getAdminUsers`, users table) | `Backend_user/admin/routes.py` (`GET /admin/users`), `Backend_user/admin/UserManagement.py` (`get_users`) | Yes | None major |
| 1. User Management: assign roles (admin/member) | Fully working | `frontend/src/pages/AdminUsersPage.tsx` (`handleRoleChange`, role controls) | `Backend_user/admin/routes.py` (`PATCH /admin/users/{user_id}`), `Backend_user/admin/UserManagement.py` (`update_user`) | Yes | Label is `user/admin` (not literal `member/admin`), but functionally role assignment works |
| 1. User Management: show created date | Fully working | `frontend/src/pages/AdminUsersPage.tsx` (`Created` column, `formatDate`) | `created_at` returned by user query in `Backend_user/admin/UserManagement.py` | Yes | None major |
| 2. Event Management: create event | Fully working | `frontend/src/pages/AdminEventsPage.tsx` (`New Event`, create submit) | `Backend_user/admin/routes.py` (`POST /admin/events`), `Backend_user/admin/Event_Registration.py` (`EventCreation`) | Yes | None major |
| 2. Event Management: edit event | Fully working | `frontend/src/pages/AdminEventsPage.tsx` (`handleOpenEdit`, update submit) | `Backend_user/admin/routes.py` (`PATCH /admin/events/{event_id}`), `Backend_user/admin/Event_Registration.py` (`update_event`) | Yes | None major |
| 2. Event Management: delete event | Fully working | `frontend/src/pages/AdminEventsPage.tsx` (`handleDelete`) | `Backend_user/admin/routes.py` (`DELETE /admin/events/{event_id}`), `Backend_user/admin/Event_Registration.py` (`delete_event`) | Yes | UI always uses `force_delete=true` |
| 2. Event Management: view registrations for an event | Fully working | `frontend/src/pages/AdminEventsPage.tsx` (eye button + registrations drawer) | `Backend_user/admin/routes.py` (`GET /admin/events/{event_id}/registrations`), `Backend_user/admin/Event_Registration.py` (`get_event_registrations`) | Yes | No explicit page-level pagination/export controls |
| 3. Registration Management: view who registered for each event | Fully working | `frontend/src/pages/AdminEventsPage.tsx` (registrations list rendering) | Same registration endpoint/service as above | Yes | Only basic participant fields shown |
| 3. Registration Management: export participant list | Missing | No export CTA in `frontend/src/pages/AdminEventsPage.tsx` | No export route/service in `Backend_user/admin/routes.py` or `Backend_user/admin/Event_Registration.py` | No | CSV/XLSX export flow not implemented |
| 4. Resource Management: add resource | Fully working | `frontend/src/pages/AdminResourcesPage.tsx` (Add Resource modal + submit) | `Backend_user/admin/routes.py` (`POST /admin/resources`), `Backend_user/admin/ResourceManagement.py` (`create_resource`) | Yes | None major |
| 4. Resource Management: categorize resource | Fully working | `frontend/src/pages/AdminResourcesPage.tsx` (category input + category display) | `Backend_user/admin/ResourceManagement.py` (category persisted and queryable) | Yes | Category is free text; no strict controlled taxonomy |
| 4. Resource Management: edit/update resource | Broken | No edit action or edit flow in `frontend/src/pages/AdminResourcesPage.tsx` | `Backend_user/admin/routes.py` (`PATCH /admin/resources/{resource_id}`), `Backend_user/admin/ResourceManagement.py` (`update_resource`) | No | Backend exists but frontend does not call update API |
| 4. Resource Management: delete resource | Fully working | `frontend/src/pages/AdminResourcesPage.tsx` (`handleDelete`) | `Backend_user/admin/routes.py` (`DELETE /admin/resources/{resource_id}`), `Backend_user/admin/ResourceManagement.py` (`delete_resource`) | Yes | None major |

## Explicit Answers

### 1. Whether user role assignment works
**Yes, it works end-to-end.**
- Frontend: `frontend/src/pages/AdminUsersPage.tsx` (`handleRoleChange` -> `updateAdminUser`)
- Backend: `PATCH /admin/users/{user_id}` in `Backend_user/admin/routes.py`, handled by `update_user` in `Backend_user/admin/UserManagement.py`

### 2. Whether resource categorization is real
**Yes, categorization is real and persisted, but free-text.**
- Frontend sends category: `frontend/src/pages/AdminResourcesPage.tsx`
- Backend stores/returns category: `Backend_user/admin/ResourceManagement.py`
- This is not a strict taxonomy (no controlled list enforced server-side)

### 3. Whether any dead admin CTA still remains
**Yes, dead/decorative admin CTAs still remain.**
- Resource edit/update flow is missing in UI (backend patch exists, no frontend wiring)
- Events page "Upcoming" filter button appears decorative (no actual filter state usage)
- Admin layout Sign Out button appears not wired to auth logout flow

### 4. Whether Projects should stay in primary admin navigation for actual scope
**No, not for the scope defined here.**
- Required scope includes only: Users, Events/Registrations, Resources
- Projects is currently in primary nav (`frontend/src/layouts/AdminAreaLayout.tsx`) but is out of required scope
- Recommendation: move Projects to secondary nav or remove from primary until explicitly in scope

## Summary

Current admin implementation is strong for:
- User listing/roles/created date
- Event create/edit/delete + view registrations
- Resource add/category/delete

Still missing or broken for required scope:
- **Export participant list** (missing)
- **Resource edit/update UI flow** (broken: backend ready, frontend absent)

