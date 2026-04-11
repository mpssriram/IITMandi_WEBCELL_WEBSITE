INSERT INTO users (firebase_uid, name, email, roll_number, password, role)
SELECT NULL, 'Dev Cell Admin', 'admin@iitmandi.ac.in', 'ADMIN001', 'firebase_auth', 'admin'
WHERE NOT EXISTS (
    SELECT 1 FROM users WHERE email = 'admin@iitmandi.ac.in'
);

INSERT INTO events (title, description, date, time, location, organizer, max_participants)
SELECT 'Admin Sprint Planning', 'Planning session for the next release cycle and ownership alignment.', '2026-04-18', '17:00:00', 'CSE Seminar Room', 'Dev Cell Admin Desk', 40
WHERE NOT EXISTS (
    SELECT 1 FROM events WHERE title = 'Admin Sprint Planning'
);

INSERT INTO events (title, description, date, time, location, organizer, max_participants)
SELECT 'Full Stack Bootcamp', 'Hands-on workshop covering frontend integration, APIs, and deployment basics.', '2026-04-24', '10:00:00', 'Lecture Hall Complex', 'Web Team', 60
WHERE NOT EXISTS (
    SELECT 1 FROM events WHERE title = 'Full Stack Bootcamp'
);

INSERT INTO events (title, description, date, time, location, organizer, max_participants)
SELECT 'Demo Day Review', 'Internal review of student demos before the public showcase.', '2026-05-03', '15:30:00', 'Innovation Lab', 'Projects Team', 25
WHERE NOT EXISTS (
    SELECT 1 FROM events WHERE title = 'Demo Day Review'
);

INSERT INTO event_registrations (event_id, full_name, email, roll_no, branch, year_of_study, phone, notes)
SELECT e.id, 'Ananya Kapoor', 'ananya@iitmandi.ac.in', 'B23102', 'CSE', '3rd Year', '9999990001', 'Interested in frontend track'
FROM events e
WHERE e.title = 'Full Stack Bootcamp'
  AND NOT EXISTS (
      SELECT 1 FROM event_registrations er
      WHERE er.event_id = e.id AND er.email = 'ananya@iitmandi.ac.in'
  );

INSERT INTO event_registrations (event_id, full_name, email, roll_no, branch, year_of_study, phone, notes)
SELECT e.id, 'Rohan Mehta', 'rohan@iitmandi.ac.in', 'B22114', 'EE', '4th Year', '9999990002', 'Prefers backend API sessions'
FROM events e
WHERE e.title = 'Full Stack Bootcamp'
  AND NOT EXISTS (
      SELECT 1 FROM event_registrations er
      WHERE er.event_id = e.id AND er.email = 'rohan@iitmandi.ac.in'
  );

INSERT INTO event_registrations (event_id, full_name, email, roll_no, branch, year_of_study, phone, notes)
SELECT e.id, 'Ishita Rana', 'ishita@iitmandi.ac.in', 'B24111', 'CSE', '2nd Year', '9999990003', 'Wants to help with logistics'
FROM events e
WHERE e.title = 'Admin Sprint Planning'
  AND NOT EXISTS (
      SELECT 1 FROM event_registrations er
      WHERE er.event_id = e.id AND er.email = 'ishita@iitmandi.ac.in'
  );

INSERT INTO Team (name, roll_no, url, role)
SELECT 'Aarav Sharma', 'B21001', 'https://github.com/aarav-sharma', 'Head'
WHERE NOT EXISTS (
    SELECT 1 FROM Team WHERE roll_no = 'B21001'
);

INSERT INTO Team (name, roll_no, url, role)
SELECT 'Neha Verma', 'B22014', 'https://github.com/neha-verma', 'Admin'
WHERE NOT EXISTS (
    SELECT 1 FROM Team WHERE roll_no = 'B22014'
);

INSERT INTO Team (name, roll_no, url, role)
SELECT 'Kunal Singh', 'B23009', 'https://github.com/kunal-singh', 'Core Team'
WHERE NOT EXISTS (
    SELECT 1 FROM Team WHERE roll_no = 'B23009'
);

INSERT INTO Team (name, roll_no, url, role)
SELECT 'Priya Nair', 'B24007', 'https://github.com/priya-nair', 'Member'
WHERE NOT EXISTS (
    SELECT 1 FROM Team WHERE roll_no = 'B24007'
);

INSERT INTO resources (title, description, type, url, category, uploaded_by)
SELECT 'Admin Operations Checklist', 'One-page checklist for publishing updates and validating public content.', 'doc', 'https://example.org/resources/admin-ops-checklist', 'operations', 'Dev Cell Admin'
WHERE NOT EXISTS (
    SELECT 1 FROM resources WHERE title = 'Admin Operations Checklist'
);

INSERT INTO resources (title, description, type, url, category, uploaded_by)
SELECT 'Build & Ship Sprint Announcement', 'Announcement and prep notes for the April sprint weekend.', 'article', 'https://example.org/resources/build-ship-announcement', 'announcements', 'Aarav Sharma'
WHERE NOT EXISTS (
    SELECT 1 FROM resources WHERE title = 'Build & Ship Sprint Announcement'
);

INSERT INTO resources (title, description, type, url, category, uploaded_by)
SELECT 'Frontend Review Recording', 'Recording and notes from the responsive UI review session.', 'video', 'https://example.org/resources/frontend-review-recording', 'frontend', 'Neha Verma'
WHERE NOT EXISTS (
    SELECT 1 FROM resources WHERE title = 'Frontend Review Recording'
);

INSERT INTO projects (
    title,
    short_description,
    full_description,
    tech_stack,
    github_url,
    live_url,
    image_url,
    status,
    current_lead,
    former_leads,
    contributors,
    featured,
    display_order
)
SELECT
    'Dev Cell Portal',
    'Unified portal for events, resources, and team updates.',
    'A central portal that gives students one place to discover Dev Cell activities and submit participation forms.',
    'React, FastAPI, MySQL, Tailwind',
    'https://github.com/example/devcell-portal',
    'https://devcell.example.org',
    'https://images.example.org/devcell-portal.png',
    'active',
    'Aarav Sharma',
    'Riya Thakur',
    'Aarav Sharma, Neha Verma, Kunal Singh',
    TRUE,
    1
WHERE NOT EXISTS (
    SELECT 1 FROM projects WHERE title = 'Dev Cell Portal'
);

INSERT INTO projects (
    title,
    short_description,
    full_description,
    tech_stack,
    github_url,
    live_url,
    image_url,
    status,
    current_lead,
    former_leads,
    contributors,
    featured,
    display_order
)
SELECT
    'Workshop CMS',
    'Internal dashboard for publishing workshop assets quickly.',
    'CMS-like utility for coordinators to post event material, links, and recap notes with minimal friction.',
    'FastAPI, MySQL, HTMX',
    'https://github.com/example/workshop-cms',
    NULL,
    NULL,
    'maintenance',
    'Neha Verma',
    'Siddhant Jain',
    'Neha Verma, Rohit Mehta',
    FALSE,
    2
WHERE NOT EXISTS (
    SELECT 1 FROM projects WHERE title = 'Workshop CMS'
);

INSERT INTO projects (
    title,
    short_description,
    full_description,
    tech_stack,
    github_url,
    live_url,
    image_url,
    status,
    current_lead,
    former_leads,
    contributors,
    featured,
    display_order
)
SELECT
    'Dev Cell Onboarding Kit',
    'Starter experience for new members with curated tasks and resources.',
    'Guided onboarding flow to help new contributors pick domains, complete first tasks, and connect with mentors.',
    'React, FastAPI, PostgreSQL',
    NULL,
    'https://onboarding.example.org',
    NULL,
    'planned',
    'Kunal Singh',
    'Aarav Sharma',
    'Kunal Singh, Priya Nair',
    FALSE,
    3
WHERE NOT EXISTS (
    SELECT 1 FROM projects WHERE title = 'Dev Cell Onboarding Kit'
);

INSERT INTO team_members (
    full_name,
    role,
    team_domain,
    year,
    bio,
    skills,
    photo_url,
    linkedin_url,
    github_url,
    email,
    active,
    display_order
)
SELECT
    'Aarav Sharma',
    'Lead',
    'Web Platform',
    '4th Year',
    'Leads platform direction and release quality.',
    'React, API Design, System Architecture',
    'https://images.example.org/aarav.jpg',
    'https://linkedin.com/in/aarav-sharma',
    'https://github.com/aarav-sharma',
    'aarav@iitmandi.ac.in',
    TRUE,
    1
WHERE NOT EXISTS (
    SELECT 1 FROM team_members WHERE email = 'aarav@iitmandi.ac.in'
);

INSERT INTO team_members (
    full_name,
    role,
    team_domain,
    year,
    bio,
    skills,
    photo_url,
    linkedin_url,
    github_url,
    email,
    active,
    display_order
)
SELECT
    'Neha Verma',
    'Core Member',
    'Frontend',
    '3rd Year',
    'Focuses on interaction design and UI polish.',
    'TypeScript, Tailwind, UX Writing',
    'https://images.example.org/neha.jpg',
    'https://linkedin.com/in/neha-verma',
    'https://github.com/neha-verma',
    'neha@iitmandi.ac.in',
    TRUE,
    2
WHERE NOT EXISTS (
    SELECT 1 FROM team_members WHERE email = 'neha@iitmandi.ac.in'
);

INSERT INTO team_members (
    full_name,
    role,
    team_domain,
    year,
    bio,
    skills,
    photo_url,
    linkedin_url,
    github_url,
    email,
    active,
    display_order
)
SELECT
    'Kunal Singh',
    'Associate Member',
    'Backend',
    '2nd Year',
    'Contributes to API development and test automation.',
    'Python, FastAPI, SQL',
    NULL,
    NULL,
    'https://github.com/kunal-singh',
    'kunal@iitmandi.ac.in',
    TRUE,
    3
WHERE NOT EXISTS (
    SELECT 1 FROM team_members WHERE email = 'kunal@iitmandi.ac.in'
);

INSERT INTO former_leads (
    full_name,
    role_title,
    tenure_start,
    tenure_end,
    handled_projects,
    linkedin_url,
    github_url,
    photo_url,
    short_note,
    visible_on_site
)
SELECT
    'Riya Thakur',
    'Dev Cell Lead',
    '2023-07-01',
    '2024-06-30',
    'Dev Cell Portal, Contributor Mentorship Program',
    'https://linkedin.com/in/riya-thakur',
    'https://github.com/riya-thakur',
    'https://images.example.org/riya.jpg',
    'Set up the first release checklist and peer review rhythm.',
    TRUE
WHERE NOT EXISTS (
    SELECT 1 FROM former_leads WHERE full_name = 'Riya Thakur' AND role_title = 'Dev Cell Lead'
);

INSERT INTO former_leads (
    full_name,
    role_title,
    tenure_start,
    tenure_end,
    handled_projects,
    linkedin_url,
    github_url,
    photo_url,
    short_note,
    visible_on_site
)
SELECT
    'Siddhant Jain',
    'Technical Head',
    '2022-07-01',
    '2023-06-30',
    'Workshop CMS, Event Registration Revamp',
    'https://linkedin.com/in/siddhant-jain',
    NULL,
    NULL,
    'Established backend conventions and deployment docs.',
    TRUE
WHERE NOT EXISTS (
    SELECT 1 FROM former_leads WHERE full_name = 'Siddhant Jain' AND role_title = 'Technical Head'
);

INSERT INTO website_events (
    title,
    type,
    description,
    date,
    venue,
    registration_link,
    poster_image_url,
    speakers,
    organizers,
    status,
    featured
)
SELECT
    'Build & Ship Sprint',
    'workshop',
    'Hands-on sprint to take an idea from wireframe to deployed MVP in one weekend.',
    '2026-04-20',
    'Lecture Hall Complex, IIT Mandi',
    'https://forms.example.org/build-ship-sprint',
    'https://images.example.org/event-build-ship.jpg',
    'Aarav Sharma, Guest Mentor',
    'Dev Cell Core Team',
    'upcoming',
    TRUE
WHERE NOT EXISTS (
    SELECT 1 FROM website_events WHERE title = 'Build & Ship Sprint'
);

INSERT INTO website_events (
    title,
    type,
    description,
    date,
    venue,
    registration_link,
    poster_image_url,
    speakers,
    organizers,
    status,
    featured
)
SELECT
    'Frontend Review Jam',
    'showcase',
    'Open review session focused on responsive layouts, accessibility, and interaction quality.',
    '2026-05-02',
    'CSE Seminar Room',
    'https://forms.example.org/frontend-review-jam',
    'https://images.example.org/event-review-jam.jpg',
    'Neha Verma',
    'Design + Frontend Domain',
    'upcoming',
    FALSE
WHERE NOT EXISTS (
    SELECT 1 FROM website_events WHERE title = 'Frontend Review Jam'
);

INSERT INTO join_applications (name, email, year, interest, message, created_at)
SELECT 'Sanjana Gupta', 'sanjana@iitmandi.ac.in', '2nd Year', 'Frontend', 'Would love to help with React UI and content updates.', NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM join_applications WHERE email = 'sanjana@iitmandi.ac.in'
);

INSERT INTO join_applications (name, email, year, interest, message, created_at)
SELECT 'Arpit Bansal', 'arpit@iitmandi.ac.in', '3rd Year', 'Backend', 'Interested in APIs, auth flows, and deployment automation.', NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM join_applications WHERE email = 'arpit@iitmandi.ac.in'
);
