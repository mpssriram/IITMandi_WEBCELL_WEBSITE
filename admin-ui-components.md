# Admin UI Components Inventory

## 1. Route and Layout Components
- `ProtectedAdminRoute`  
  File: `frontend/src/routes/ProtectedAdminRoute.tsx`
- `AdminAreaLayout`  
  File: `frontend/src/layouts/AdminAreaLayout.tsx`

## 2. Admin Page Components
- `AdminLogin`  
  File: `frontend/src/pages/AdminLogin.tsx`
- `AdminDashboardPage`  
  File: `frontend/src/pages/AdminDashboardPage.tsx`
- `AdminUsersPage`  
  File: `frontend/src/pages/AdminUsersPage.tsx`
- `AdminEventsPage`  
  File: `frontend/src/pages/AdminEventsPage.tsx`
- `AdminProjectsPage`  
  File: `frontend/src/pages/AdminProjectsPage.tsx`
- `AdminResourcesPage`  
  File: `frontend/src/pages/AdminResourcesPage.tsx`
- `AdminAnnouncementsPage`  
  File: `frontend/src/pages/AdminAnnouncementsPage.tsx`

## 3. Shared UI Components Used in Admin Flow
- `AccessDenied`  
  File: `frontend/src/components/AccessDenied.tsx`
- `GridScan`  
  File: `frontend/src/components/GridScan.tsx`
- `ElectricCard`  
  File: `frontend/src/components/ElectricCard.tsx`
- Auth UI Kit (`AuthCard.tsx`):
  - `AuthShell`
  - `AuthBadge`
  - `AuthInput`
  - `AuthButton`
  - `AuthMessage`
  - `AuthDivider`  
  File: `frontend/src/components/AuthCard.tsx`
- `Hyperspeed` (used by `AuthShell`)  
  File: `frontend/src/components/Hyperspeed.tsx`

## 4. In-Page Local Subcomponents (Admin-Only)
- Dashboard (`AdminDashboardPage.tsx`)
  - `OverviewStat`
  - `SectionHeader`
- Users (`AdminUsersPage.tsx`)
  - `TH`
  - `UserRow`
- Projects (`AdminProjectsPage.tsx`)
  - `TH`
  - `ProjectRow`
- Announcements (`AdminAnnouncementsPage.tsx`)
  - `AnnouncementRow`

## 5. Admin Route Map (for UI Context)
Defined in `frontend/src/main.tsx`

- `/admin/login` → `AdminLoginPage`
- `/admin/dashboard` → `AdminDashboardPage`
- `/admin/users` → `AdminUsersPage`
- `/admin/events` → `AdminEventsPage`
- `/admin/projects` → `AdminProjectsPage`
- `/admin/resources` → `AdminResourcesPage`
- `/admin/announcements` → `AdminAnnouncementsPage`

## 6. Current UI Design Patterns Used (Admin)
### Visual Style
- Dark, glassmorphism-leaning interface (`bg-[#030711]`, `bg-[#050b18]/40`, `backdrop-blur-*`)
- Neon cyan accent system for primary actions/highlights (`bg-cyan-400`, cyan glow shadows)
- Secondary semantic accents:
  - Success/active: emerald
  - Warning/pending: amber
  - Danger/delete/error: rose
  - Admin role emphasis: violet
- Subtle tech-background overlays:
  - `GridScan` animated grid
  - `Hyperspeed` ambient motion (auth shell)

### Layout Patterns
- Persistent left sidebar + top header shell (`AdminAreaLayout`)
- Breadcrumb path in header
- Standard page structure:
  - Title + short description
  - Top-right primary CTA button
  - Search/filter control bar
  - Main data region (table or cards)

### Component Patterns
- Card surfaces:
  - `ElectricCard` for highlight/stat sections
  - Rounded corners (`rounded-xl`, `rounded-2xl`, `rounded-[2rem]`)
  - Soft border + glow combinations
- Data display:
  - Dense management tables for CRUD pages
  - Hover-revealed row actions (`opacity-0 group-hover:opacity-100`)
  - Status pills/chips for role/state/category
- Forms:
  - Modal-centered create/edit forms
  - Consistent input height (`h-11`) and uppercase micro-labels
  - Inline submit error blocks
- Overlays:
  - Full-screen modal for create/edit flows
  - Right-side drawer for event registrations

### Motion and Interaction
- Lightweight transitions (`transition-colors`, `transition-all`)
- Hover lift/brightness on primary CTA actions
- Spinner-based loading states
- Empty-state placeholders with icon + guidance text

### Typography and Spacing Conventions
- Heading emphasis with `font-display` and tight tracking
- Microcopy often in uppercase with wide letter-spacing (`tracking-[0.12em]` to `0.26em`)
- Compact admin density:
  - Page rhythm: `space-y-6`
  - Table text sizes mostly `11px`–`13px`

## 7. Design Tokens to Keep (Practical)
- Primary accent: cyan (`cyan-300`/`cyan-400`)
- Base surfaces: near-black blues (`#030711`, `#050b18`, `#0d121f`)
- Border opacity language: `border-white/[0.04-0.10]`
- Radius scale: `lg` to `2xl` + occasional `2rem` hero containers
- Shadow style: soft glow (`shadow-[0_0_20px_rgba(34,211,238,0.2)]`)
