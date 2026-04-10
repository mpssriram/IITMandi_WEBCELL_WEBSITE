-- Minimal sample seed data for public website sections

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
VALUES
(
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
),
(
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
VALUES
(
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
),
(
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
VALUES
(
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
),
(
    'Siddhant Jain',
    'Technical Head',
    '2022-07-01',
    '2023-06-30',
    'Workshop CMS, Event Registration Revamp',
    'https://linkedin.com/in/siddhant-jain',
    'https://github.com/siddhant-jain',
    'https://images.example.org/siddhant.jpg',
    'Established backend conventions and deployment docs.',
    TRUE
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
VALUES
(
    'Build & Ship Sprint',
    'Workshop',
    'Hands-on sprint to take an idea from wireframe to deployed MVP in one weekend.',
    '2026-04-20',
    'Lecture Hall Complex, IIT Mandi',
    'https://forms.example.org/build-ship-sprint',
    'https://images.example.org/event-build-ship.jpg',
    'Aarav Sharma, Guest Mentor',
    'Dev Cell Core Team',
    'upcoming',
    TRUE
),
(
    'Frontend Review Jam',
    'Peer Review',
    'Open review session focused on responsive layouts, accessibility, and interaction quality.',
    '2026-05-02',
    'CSE Seminar Room',
    'https://forms.example.org/frontend-review-jam',
    'https://images.example.org/event-review-jam.jpg',
    'Neha Verma',
    'Design + Frontend Domain',
    'upcoming',
    FALSE
);
