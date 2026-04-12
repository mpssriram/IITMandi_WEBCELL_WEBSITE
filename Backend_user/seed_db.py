from __future__ import annotations

import argparse
from dataclasses import dataclass
from datetime import date, datetime, timedelta

from Backend_user.Database import Database
from Backend_user.config import Config


@dataclass(frozen=True)
class SeedSummary:
    users: int
    events: int
    event_registrations: int
    resources: int
    team: int
    team_members: int
    projects: int
    former_leads: int
    website_events: int
    join_applications: int
    announcements: int


def _build_users() -> list[dict]:
    first = ["Aarav", "Vihaan", "Aditya", "Krish", "Arjun", "Ishaan", "Atharv", "Kabir", "Ananya", "Saanvi", "Aditi", "Diya", "Ira", "Prisha", "Ritika", "Nandini", "Meera", "Harshit", "Palak", "Lakshya", "Shruti", "Tanmay", "Vanshika", "Rohit", "Kashish", "Aman", "Niharika", "Raghav", "Sonal", "Yashika"]
    last = ["Sharma", "Verma", "Nair", "Rana", "Gupta", "Bansal", "Mehta", "Kapoor", "Negi", "Chauhan", "Rawat", "Saxena", "Tripathi", "Kohli", "Bisht", "Thakur", "Joshi", "Saini", "Purohit", "Jain", "Pandey", "Mahajan", "Arora", "Mishra", "Bhardwaj", "Sodhi", "Shukla", "Bedi", "Monga", "Khurana"]
    branches = ["CSE", "DS", "EE", "ME", "CE", "BS"]
    users = [{
        "firebase_uid": "seed_admin_uid_000",
        "name": "Dev Cell Admin",
        "email": "admin@iitmandi.ac.in",
        "roll_number": "ADMIN001",
        "password": "firebase_auth",
        "role": "admin",
        "active": 1,
        "branch": "CSE",
        "year": "4th Year",
        "created_at": datetime(2024, 8, 5, 10, 0, 0),
    }]
    for i in range(1, 60):
        f = first[i % len(first)]
        l = last[(i * 5) % len(last)]
        year = 2021 + (i % 5)
        users.append({
            "firebase_uid": f"seed_uid_{i:04d}" if i <= 44 else None,
            "name": f"{f} {l}",
            "email": f"{f.lower()}.{l.lower()}{i}@students.iitmandi.ac.in",
            "roll_number": f"B{year % 100:02d}{i:03d}",
            "password": "firebase_auth",
            "role": "admin" if i in {4, 8, 12, 16, 24, 32, 40, 52} else "user",
            "active": 0 if i in {55, 56, 57, 58, 59} else 1,
            "branch": branches[i % len(branches)],
            "year": f"{(i % 4) + 1}th Year",
            "created_at": datetime(2024, 7, 1, 9, 0, 0) + timedelta(days=i * 7),
        })
    return users


def _build_events() -> list[dict]:
    catalog = [
        ("Hackstart Mandi 2025", "hackathon", "48-hour beginner-friendly campus hackathon with mentor checkpoints in both North and South campus hostels.", "North Campus Auditorium", "Dev Club + CSE Society", 120, "10:00:00"),
        ("Python for Research Workflows", "workshop", "Notebook hygiene, reproducible experiments, and data logging for B.Tech and MS research projects.", "CSE Smart Classroom (A-201)", "AI/ML Domain", 80, "14:00:00"),
        ("Open Source Contribution Drive", "contribution", "First PR drive for open-source repos maintained by IIT Mandi seniors and alumni.", "HPC Lab", "Open Source Circle", 70, "17:30:00"),
        ("Winter Web Bootcamp", "bootcamp", "Three-day full-stack bootcamp ending with a deployment challenge on institute infra.", "Lecture Hall Complex - LH3", "Web Domain", 90, "10:00:00"),
        ("System Design Fundamentals", "talk", "Practical design interview prep focused on student products: auth, queues, and observability.", "Seminar Room B", "Backend Domain", 60, "16:15:00"),
        ("Resume and Portfolio Clinic", "clinic", "1:1 resume reviews for internship season with portfolio walkthrough and LinkedIn feedback.", "Student Activity Center", "Career Prep Team", 75, "11:00:00"),
        ("Git and DevOps Basics", "workshop", "Branching strategy, CI pipelines, and release tagging used by active IIT Mandi club projects.", "Data Systems Lab", "Infra Domain", 65, "15:00:00"),
        ("Competitive Coding Ladder Round", "contest", "Div-2 style ladder round with post-contest editorial discussion by CP leads.", "Computer Centre + Online", "CP Domain", 150, "18:00:00"),
        ("ML in Production", "tech-talk", "How student ML models move from Colab to APIs with basic monitoring and rollback strategy.", "Innovation Hub", "AI/ML Domain", 55, "14:30:00"),
        ("Code Review Jam", "session", "Live PR reviews from actual club repos with focus on maintainability and testing trade-offs.", "Seminar Room C", "Projects Team", 45, "17:00:00"),
        ("Build and Ship Sprint", "sprint", "Weekend sprint to close open issues and publish one production release across club products.", "Lecture Hall Complex - LH1", "Dev Cell Admin Desk", 60, "10:00:00"),
        ("Design Systems Workshop", "workshop", "Reusable component and typography system workshop for React apps used in campus clubs.", "Design Studio", "Frontend Domain", 50, "16:00:00"),
        ("API Security Essentials", "security", "Auth token handling, rate limiting, and SQL injection prevention for student APIs.", "CSE Seminar Room", "Security Circle", 40, "15:30:00"),
        ("Mock Interviews Prep", "interview", "DSA + project interview simulation for pre-final year students preparing for summer internships.", "Placement Cell Hall", "Career Prep Team", 100, "11:30:00"),
        ("Dev Cell Orientation 2026", "orientation", "Domain introductions, mentorship model, and project onboarding for incoming batch members.", "Main Auditorium", "Executive Team", 200, "09:45:00"),
        ("Hack The Hills Prelims", "hackathon", "Team selection round for inter-college innovation challenge hosted in Himachal circuit.", "Computer Center", "Hackathon Committee", 140, "13:00:00"),
        ("Kubernetes for Campus Deployments", "workshop", "Hands-on session using staging clusters to deploy and monitor student services.", "Infra Lab", "Infra Domain", 35, "16:30:00"),
        ("Demo Day Autumn Showcase", "showcase", "Public demo event for semester projects with jury feedback from alumni and faculty mentors.", "Innovation Hub Atrium", "Projects Team", None, "15:00:00"),
    ]
    starts = date(2025, 9, 14)
    events = []
    for idx, item in enumerate(catalog, start=1):
        title, kind, description, location, organizer, max_p, tm = item
        events.append({
            "id": idx,
            "title": title,
            "description": description,
            "date": starts + timedelta(days=idx * 21),
            "time": tm,
            "location": location,
            "organizer": organizer,
            "max_participants": max_p,
            "type": kind,
        })
    return events


def _build_registrations(users: list[dict], events: list[dict]) -> list[dict]:
    desired = {1: 104, 2: 63, 3: 48, 4: 90, 5: 42, 6: 37, 7: 35, 8: 128, 9: 29, 10: 18, 11: 56, 12: 31, 13: 40, 14: 67, 15: 93, 16: 58, 17: 0, 18: 22}
    regs = []
    pool = users[1:]
    reg_notes = [
        "Asked for team-matching in pre-event mixer.",
        "Interested in backend-heavy problem statements.",
        "Bringing hostel LAN setup extension board.",
        "Needs certificate for CDC internship portfolio.",
        "Prefers design/frontend track for sprint.",
        "Volunteered for registration desk support.",
        "Joining with previous hackathon teammate.",
        "Wants guidance on open-source first issue.",
    ]
    for event in events:
        c = desired[event["id"]]
        for i in range(c):
            user = pool[(event["id"] * 7 + i) % len(pool)]
            email = user["email"] if i < len(pool) else f"guest{event['id']}.{i}@iitmandi.ac.in"
            roll_no = user["roll_number"] if i < len(pool) else None
            regs.append({
                "event_id": event["id"],
                "full_name": user["name"],
                "email": email,
                "roll_no": roll_no,
                "branch": user["branch"],
                "year_of_study": user["year"],
                "phone": str(9100000000 + (event["id"] * 300) + i),
                "notes": f"uid_link={user['firebase_uid']}" if i % 5 == 0 and user["firebase_uid"] else reg_notes[(event["id"] + i) % len(reg_notes)],
                "created_at": datetime.combine(event["date"], datetime.strptime(event["time"], "%H:%M:%S").time()) - timedelta(days=(c - i) // 7 + 1),
            })
    return regs


def _build_resources() -> list[dict]:
    catalog = [
        ("Mandi Hackstart 2025 Problem Statements", "pdf", "events", "Problem statements, evaluation rubrics, and final submission checklist."),
        ("FastAPI + MySQL Boilerplate Used by Dev Club", "doc", "backend", "Starter structure used in current club backend repositories."),
        ("Figma to React Handoff Checklist", "article", "frontend", "Design QA checklist used before merging UI pull requests."),
        ("IIT Mandi Open Source Repos to Contribute", "link", "open-source", "Curated set of active student-maintained repositories."),
        ("Docker Compose for Local Club Projects", "video", "devops", "Recorded walkthrough from internal infra onboarding session."),
        ("DSA Sprint Sheet - Internship 2026", "pdf", "placements", "Topic-wise question sheet used by placement prep circle."),
        ("Campus API Security Review Notes", "doc", "security", "Threat-model and checklist used for student-facing APIs."),
        ("Postman Collection Standards", "article", "backend", "Naming and structure conventions followed by projects team."),
        ("React Query + Auth Token Patterns", "doc", "frontend", "Implementation patterns from the current portal frontend."),
        ("Event Operations Runbook", "pdf", "operations", "Checklist for registration desk, attendance, and certificate release."),
        ("Kubernetes Staging Cluster Quickstart", "video", "devops", "How club members deploy and observe staging workloads."),
        ("Research Notebook Reproducibility Guide", "article", "ai", "Guidelines for experiment tracking and baseline logging."),
        ("Build & Ship Sprint Retro Template", "doc", "projects", "Retrospective template used after release weekends."),
        ("Campus Product Metrics Dashboard SQL", "other", "database", "Ready SQL snippets used for dashboard counts and trends."),
        ("Code Review Rubric for Core Team", "pdf", "engineering-practices", "Rubric for readability, testing, and API consistency."),
        ("Frontend Accessibility Audit Checklist", "article", "frontend", "Practical checks for keyboard nav and contrast."),
        ("GitHub Actions for Python + Vite CI", "doc", "devops", "Reference workflow used by club projects."),
        ("System Design Interview Notes from Alumni AMA", "pdf", "placements", "Consolidated notes from alumni panel discussion."),
        ("Campus Map API Integration Snippets", "other", "backend", "Reusable snippets used by location-aware event pages."),
        ("Prompt Engineering for Club Chatbot", "article", "ai", "Prompt structures used in student support bot experiments."),
        ("SQL Indexing for Events and Registrations", "doc", "database", "Index strategy for high-read dashboard queries."),
        ("Mentor Allocation Spreadsheet Template", "link", "operations", "Template used during hackathon mentor assignment."),
        ("UI Component Naming Standards", "pdf", "frontend", "Naming convention followed in shared component library."),
        ("Monitoring Alerts for Student Services", "doc", "devops", "Alert thresholds and escalation notes for infra team."),
        ("Interview Debrief Capture Form", "other", "placements", "Structured interviewer feedback collection format."),
        ("Practical ETL for Club Analytics", "article", "data", "Transforming raw registration CSV into dashboard-ready tables."),
        ("Design Tokens Starter for Tailwind", "doc", "frontend", "Token map currently used for consistency across pages."),
        ("MySQL Query Review Session Recording", "video", "database", "Recording from internal optimization workshop."),
        ("Open Source First PR Walkthrough", "video", "open-source", "End-to-end example from issue pick to merge."),
        ("Backend Error Response Standard", "doc", "backend", "Error payload contract used by frontend integrations."),
        ("Workshop Certificate Automation Notes", "article", "operations", "Automated certificate generation and mail workflow."),
        ("Competitive Programming Ladder Rules", "pdf", "cp", "Contest ladder scoring and tie-break policy."),
        ("Feature Prioritization Matrix", "other", "projects", "Used in semester planning meetings."),
        ("Role Onboarding Kit for New Coordinators", "pdf", "operations", "Responsibilities and 30-day onboarding checklist."),
        ("UI QA Screenshots Archive Index", "link", "frontend", "Shared archive links for release review snapshots."),
        ("Alumni Mentor Outreach Email Templates", "doc", "community", "Draft templates used during demo day preparations."),
    ]
    uploader_pool = ["Aarav Sharma", "Neha Verma", "Ritika Rawat", "Kabir Joshi", "Atharv Thakur", "Ananya Kapoor"]
    rows = []
    start = datetime(2025, 7, 1, 9, 0, 0)
    for i, item in enumerate(catalog, start=1):
        title, typ, cat, desc = item
        rows.append({
            "title": title,
            "description": desc,
            "type": typ,
            "url": f"https://resources.devcell.iitmandi.ac.in/{title.lower().replace(' ', '-').replace('+', 'plus')}",
            "category": cat,
            "uploaded_by": uploader_pool[i % len(uploader_pool)],
            "created_at": start + timedelta(days=i * 8),
        })
    return rows


def _build_projects() -> list[tuple]:
    rows = [
        ("Dev Cell Portal", "Unified portal for events, resources, and member operations.", "Built as a single platform for public pages, admin operations, role-aware auth, and real-time event analytics used by Dev Club coordinators.", "React, FastAPI, MySQL, Tailwind CSS, Firebase Auth", "active", "Aarav Sharma", 1),
        ("Hostel Complaint Tracker", "Structured complaint intake and SLA tracking for hostel councils.", "Students file hostel issues with category tags, priority labels, and status transitions visible to council reps and student admins.", "React, FastAPI, MySQL, Redis", "active", "Kabir Joshi", 1),
        ("Lab Slot Scheduler", "Fair slot allocation for high-demand CSE and DS lab systems.", "Scheduler that prevents overlap, supports waitlist promotion, and exports weekly occupancy reports for lab incharges.", "React, FastAPI, MySQL", "active", "Ira Kapoor", 0),
        ("Placement Prep Hub", "Collaborative placement prep board for coding, CS core, and projects.", "Centralized prep workflow for mock interviews, sheet progress, and peer debrief notes during internship season.", "React, FastAPI, MySQL, Chart.js", "active", "Neha Verma", 1),
        ("Campus Event Explorer", "Discover institute events with filters, tags, and registration links.", "Aggregates events from club coordinators and enables filters by domain, date, and venue with organizer contact cards.", "React, FastAPI, MySQL", "maintenance", "Ritika Rawat", 0),
        ("Mess Feedback Analytics", "Weekly feedback capture and sentiment summaries for mess committee.", "Converts daily mess feedback into trend charts and actionable summaries for mess committee meetings.", "FastAPI, MySQL, Pandas, Plotly", "active", "Meera Saini", 0),
        ("Open Source Mentor Board", "Mentor-mentee matching for open-source onboarding cohorts.", "Pairs freshers with experienced contributors based on language stack and time availability.", "React, FastAPI, MySQL", "active", "Atharv Thakur", 0),
        ("Alumni Connect API", "Directory and interaction API for club alumni network.", "Secure API for alumni discovery, mentor requests, and periodic update broadcasts to current members.", "FastAPI, MySQL, JWT", "planned", "Ananya Kapoor", 0),
        ("Course Planner Plus", "Semester planner with prerequisites and workload estimator.", "Helps students compare course combinations using prerequisites, credits, and historical workload feedback.", "React, FastAPI, MySQL", "active", "Vihaan Bansal", 1),
        ("Hackathon Ops Console", "Judging, team desk, and logistics control panel for hackathons.", "Used by coordinators during events for mentor routing, judging queues, and submission tracking.", "React, FastAPI, MySQL, WebSockets", "active", "Ishaan Purohit", 0),
        ("Research Collaboration Board", "Faculty-student project collaboration listings.", "Portal for publishing short research tasks and matching students by interests and prerequisites.", "FastAPI, MySQL, React", "planned", "Aarav Sharma", 0),
        ("Campus Shuttle Tracker", "Bus route and ETA dashboard for campus commute.", "Live ETA board based on route checkpoints with simple rider-facing web interface.", "React, FastAPI, MySQL, Leaflet", "planned", "Krish Mehta", 0),
    ]
    built = []
    for i, row in enumerate(rows, start=1):
        title, short_d, full_d, stack, status, lead, featured = row
        slug = title.lower().replace(" ", "-")
        built.append((title, short_d, full_d, stack, f"https://github.com/devcell-iitmandi/{slug}", f"https://{slug}.devcell.iitmandi.ac.in", f"https://images.devcell.iitmandi.ac.in/projects/{slug}.png", status, lead, "Riya Thakur, Siddhant Jain", "Dev Cell Core Team", featured, i, datetime(2024, 10, 1, 12, 0, 0) + timedelta(days=i * 18), datetime(2026, 2, 15, 12, 0, 0) + timedelta(days=i * 3)))
    return built


def _truncate(cursor):
    cursor.execute("SET FOREIGN_KEY_CHECKS = 0")
    for table in ["event_registrations", "announcements", "join_applications", "website_events", "former_leads", "team_members", "Team", "resources", "projects", "events", "users"]:
        cursor.execute(f"TRUNCATE TABLE `{table}`")
    cursor.execute("SET FOREIGN_KEY_CHECKS = 1")


def run_seed(reset: bool = True) -> SeedSummary:
    db = Database(config=Config())
    db.ensure_core_schema()
    users = _build_users()
    events = _build_events()
    registrations = _build_registrations(users, events)
    resources = _build_resources()
    team = [
        ("Aarav Sharma", "B21001", "https://github.com/aarav-sharma", "Head"), ("Neha Verma", "B22014", "https://github.com/neha-verma", "Co-Head"),
        ("Ritika Rawat", "B22041", "https://github.com/ritika-rawat", "Admin"), ("Kabir Joshi", "B23008", "https://github.com/kabir-j", "Admin"),
        ("Ananya Kapoor", "B23024", "https://github.com/ananya-kapoor", "Co-Admin"), ("Ishaan Purohit", "B23037", "https://github.com/ishaan-purohit", "Co-Admin"),
        ("Atharv Thakur", "B24011", "https://github.com/atharv-thakur", "Core Team"), ("Meera Saini", "B24019", "https://github.com/meera-saini", "Core Team"),
        ("Vihaan Bansal", "B24028", "https://github.com/vihaan-bansal", "Core Team"), ("Ira Kapoor", "B24044", "https://github.com/ira-kapoor", "Core Team"),
        ("Arjun Negi", "B25005", "https://github.com/arjun-negi", "Member"), ("Diya Saxena", "B25016", "https://github.com/diya-saxena", "Member"),
        ("Nandini Gupta", "B25023", "https://github.com/nandini-gupta", "Member"), ("Krish Mehta", "B25031", "https://github.com/krish-mehta", "Member"),
        ("Saanvi Rana", "B25042", "https://github.com/saanvi-rana", "Member"), ("Aditya Chauhan", "B25057", "https://github.com/aditya-chauhan", "Member"),
    ]
    team_members = []
    for i, t in enumerate(team, start=1):
        f = t[0].split(" ")[0].lower()
        l = t[0].split(" ")[-1].lower()
        team_members.append((t[0], t[3], ["Engineering", "Frontend", "Operations", "Backend", "Design", "Infra", "AI/ML", "Web", "CP"][i % 9], f"{(i % 4) + 1}th Year", "Active contributor in Dev Cell execution and mentoring.", "Python, React, SQL, DevOps", f"https://images.devcell.iitmandi.ac.in/members/{f}-{l}.jpg", f"https://www.linkedin.com/in/{f}-{l}", f"https://github.com/{f}-{l}", f"{f}.{l}@iitmandi.ac.in", 1 if i <= 14 else 0, i, datetime(2025, 4, 1, 10, 0, 0) + timedelta(days=i * 9), datetime(2026, 3, 1, 10, 0, 0) + timedelta(days=i)))
    projects = _build_projects()
    former_leads = [("Riya Thakur", "Dev Cell Lead", date(2022, 7, 1), date(2023, 6, 30)), ("Siddhant Jain", "Technical Head", date(2021, 7, 1), date(2022, 6, 30)), ("Palak Verma", "Community Lead", date(2020, 7, 1), date(2021, 6, 30)), ("Harshit Rao", "Infrastructure Lead", date(2019, 7, 1), date(2020, 6, 30)), ("Ankita Mehta", "Projects Lead", date(2018, 7, 1), date(2019, 6, 30)), ("Mohit Rana", "DevOps Mentor", date(2017, 7, 1), date(2018, 6, 30)), ("Sonal Gupta", "Founding Coordinator", date(2016, 7, 1), date(2017, 6, 30)), ("Raghav Sharma", "Founding Lead", date(2015, 7, 1), date(2016, 6, 30))]
    join_apps = [(f"{n} {s}", f"{n.lower()}.{s.lower()}{i}@iitmandi.ac.in", f"{(i % 4) + 1}th Year", ["Frontend", "Backend", "AI/ML", "DevOps", "Design", "CP", "Content", "Data"][i % 8], "Interested in long-term student-facing product work.", datetime(2025, 9, 1, 8, 0, 0) + timedelta(days=i * 9)) for i, (n, s) in enumerate([("Sanjana", "Gupta"), ("Arpit", "Bansal"), ("Lavanya", "Rawat"), ("Pranav", "Thakur"), ("Mansi", "Joshi"), ("Tanmay", "Kapoor"), ("Shruti", "Nair"), ("Gautam", "Mehta"), ("Aashi", "Verma"), ("Rohan", "Sharma"), ("Prachi", "Saini"), ("Kunal", "Bisht"), ("Sneha", "Rana"), ("Utkarsh", "Negi"), ("Isha", "Tripathi"), ("Varun", "Chauhan"), ("Nikita", "Kohli"), ("Rahul", "Saxena"), ("Simran", "Gupta"), ("Naman", "Mehta"), ("Tanya", "Rawat"), ("Yash", "Bansal"), ("Aman", "Joshi"), ("Niharika", "Kapoor")], start=1)]
    announcements = [(t, "Please review this update on the Dev Cell portal for schedule and action items.", ["General", "Events", "Projects", "Operations"][i % 4], date(2026, 1, 5) + timedelta(days=i * 11), 1 if i in {1, 2, 11} else 0, datetime(2026, 1, 5, 9, 0, 0) + timedelta(days=i * 3), datetime(2026, 1, 5, 12, 0, 0) + timedelta(days=i * 3)) for i, t in enumerate(["Dev Cell Weekly Update", "Workshop Registration Window Open", "Hackathon Mentor Allocation Released", "Project Showcase Slots Published", "Infra Maintenance Notice", "Summer Internship Prep Series", "Open Source Sprint Cohorts", "CP Ladder Round Schedule", "Design Review Office Hours", "Backend API Standards Update", "Recruitment Timeline Announcement", "Demo Day Logistics Circular", "Freshers Orientation Resources", "Final Call for Mentor Applications"], start=1)]

    cursor = None
    try:
        cursor = db.get_cursor(dictionary=False)
        if reset:
            _truncate(cursor)

        cursor.executemany("INSERT INTO users (firebase_uid, name, email, roll_number, password, role, active, created_at, updated_at) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)", [(u["firebase_uid"], u["name"], u["email"], u["roll_number"], u["password"], u["role"], u["active"], u["created_at"], u["created_at"] + timedelta(days=3)) for u in users])
        cursor.executemany("INSERT INTO events (id, title, description, date, time, location, organizer, max_participants, created_at) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)", [(e["id"], e["title"], e["description"], e["date"], e["time"], e["location"], e["organizer"], e["max_participants"], datetime.combine(e["date"], datetime.strptime(e["time"], "%H:%M:%S").time()) - timedelta(days=14)) for e in events])
        cursor.executemany("INSERT INTO website_events (id, title, type, description, date, venue, registration_link, poster_image_url, speakers, organizers, status, featured, created_at, updated_at) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)", [(e["id"], e["title"], e["type"], e["description"], e["date"], e["location"], f"https://forms.devcell.iitmandi.ac.in/{e['title'].lower().replace(' ', '-')}", f"https://images.devcell.iitmandi.ac.in/events/{e['title'].lower().replace(' ', '-')}.jpg", f"{e['organizer']} mentors", e["organizer"], "upcoming" if e["date"] > date(2026, 4, 13) else "past", 1 if e["id"] in {8, 11, 15, 18} else 0, datetime(2025, 8, 1, 10, 0, 0) + timedelta(days=e["id"] * 7), datetime(2026, 3, 25, 10, 0, 0) + timedelta(days=e["id"])) for e in events])
        cursor.executemany("INSERT INTO event_registrations (event_id, full_name, email, roll_no, branch, year_of_study, phone, notes, created_at) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)", [(r["event_id"], r["full_name"], r["email"], r["roll_no"], r["branch"], r["year_of_study"], r["phone"], r["notes"], r["created_at"]) for r in registrations])
        cursor.executemany("INSERT INTO resources (title, description, type, url, category, uploaded_by, created_at) VALUES (%s, %s, %s, %s, %s, %s, %s)", [(r["title"], r["description"], r["type"], r["url"], r["category"], r["uploaded_by"], r["created_at"]) for r in resources])
        cursor.executemany("INSERT INTO Team (name, roll_no, url, role, created_at) VALUES (%s, %s, %s, %s, %s)", [(t[0], t[1], t[2], t[3], datetime(2025, 7, 1, 10, 0, 0) + timedelta(days=i * 10)) for i, t in enumerate(team, start=1)])
        cursor.executemany("INSERT INTO team_members (full_name, role, team_domain, year, bio, skills, photo_url, linkedin_url, github_url, email, active, display_order, created_at, updated_at) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)", team_members)
        cursor.executemany("INSERT INTO projects (title, short_description, full_description, tech_stack, github_url, live_url, image_url, status, current_lead, former_leads, contributors, featured, display_order, created_at, updated_at) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)", projects)
        cursor.executemany("INSERT INTO former_leads (full_name, role_title, tenure_start, tenure_end, handled_projects, linkedin_url, github_url, photo_url, short_note, visible_on_site, created_at, updated_at) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)", [(n, r, ts, te, "Portal revamp, mentorship, workshop tracks", f"https://www.linkedin.com/in/{n.lower().replace(' ', '-')}", f"https://github.com/{n.lower().replace(' ', '-')}", f"https://images.devcell.iitmandi.ac.in/former-leads/{n.lower().replace(' ', '-')}.jpg", "Contributed significantly to student engineering culture at IIT Mandi.", 1 if i <= 7 else 0, datetime(2024, 1, 1, 9, 0, 0) + timedelta(days=i * 5), datetime(2025, 12, 1, 10, 0, 0) + timedelta(days=i * 2)) for i, (n, r, ts, te) in enumerate(former_leads, start=1)])
        cursor.executemany("INSERT INTO join_applications (name, email, year, interest, message, created_at) VALUES (%s, %s, %s, %s, %s, %s)", join_apps)
        cursor.executemany("INSERT INTO announcements (title, content, category, date, is_pinned, created_at, updated_at) VALUES (%s, %s, %s, %s, %s, %s, %s)", announcements)

        db.commit()
        return SeedSummary(len(users), len(events), len(registrations), len(resources), len(team), len(team_members), len(projects), len(former_leads), len(events), len(join_apps), len(announcements))
    except Exception:
        db.rollback()
        raise
    finally:
        if cursor:
            cursor.close()
        db.close()


def main():
    parser = argparse.ArgumentParser(description="Reset and seed Dev Cell MySQL database with realistic demo data.")
    parser.add_argument("--mode", choices=["reset"], default="reset")
    args = parser.parse_args()
    summary = run_seed(reset=args.mode == "reset")
    print("Database seeding completed.")
    print(f"users: {summary.users}")
    print(f"events: {summary.events}")
    print(f"event_registrations: {summary.event_registrations}")
    print(f"resources: {summary.resources}")
    print(f"Team: {summary.team}")
    print(f"team_members: {summary.team_members}")
    print(f"projects: {summary.projects}")
    print(f"former_leads: {summary.former_leads}")
    print(f"website_events: {summary.website_events}")
    print(f"join_applications: {summary.join_applications}")
    print(f"announcements: {summary.announcements}")


if __name__ == "__main__":
    main()
