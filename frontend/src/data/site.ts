import {
    ArrowUpRight,
    Code2,
    FlaskConical,
    LayoutDashboard,
    Layers3,
    Rocket,
    Sparkles,
    Users,
} from "lucide-react";

export const navLinks = [
    { label: "About", href: "#about" },
    { label: "Tracks", href: "#tracks" },
    { label: "Projects", href: "#projects" },
    { label: "Events", href: "#events" },
    { label: "Team", href: "#team" },
    { label: "Join", href: "#join" },
];

export const heroStats = [
    { value: 120, suffix: "+", label: "builders across IIT Mandi" },
    { value: 35, suffix: "+", label: "projects, demos, and experiments" },
    { value: 18, suffix: "+", label: "workshops, talks, and bootcamps" },
    { value: 7, suffix: "+", label: "active tracks and subdomains" },
];

export const clubHighlights = [
    "Hands-on mentoring",
    "Open-source culture",
    "Design + engineering collaboration",
    "Fast feedback loops",
];

export const domains = [
    {
        title: "Frontend Engineering",
        description:
            "Build polished interfaces, design systems, animations, and responsive products with React and TypeScript.",
        icon: LayoutDashboard,
        bullets: ["React", "TypeScript", "Accessibility"],
    },
    {
        title: "Backend Systems",
        description:
            "Ship APIs, databases, authentication flows, and reliable server-side architecture for real club projects.",
        icon: Code2,
        bullets: ["FastAPI", "Databases", "Auth"],
    },
    {
        title: "UI / Motion",
        description:
            "Turn concepts into memorable experiences with motion, hierarchy, and interaction design that feels premium.",
        icon: Sparkles,
        bullets: ["Motion", "Visual Design", "Prototyping"],
    },
    {
        title: "Product Ops",
        description:
            "Coordinate launches, event logistics, documentation, and community workflows so ideas actually ship.",
        icon: Users,
        bullets: ["Planning", "Docs", "Community"],
    },
];

export const projects = [
    {
        title: "CampusConnect",
        summary:
            "A student-first event hub for clubs, registrations, reminders, and RSVPs with a clean mobile experience.",
        tags: ["React", "FastAPI", "Firebase"],
        accent: "from-cyan-500/20 via-sky-500/10 to-transparent",
        icon: Rocket,
    },
    {
        title: "DevFlow Dashboard",
        summary:
            "An internal analytics and event ops panel for tracking engagement, resources, and workshop outcomes.",
        tags: ["Dashboard", "Analytics", "Ops"],
        accent: "from-fuchsia-500/15 via-slate-500/10 to-transparent",
        icon: LayoutDashboard,
    },
    {
        title: "Open Source Sprint Kit",
        summary:
            "A starter pack of workflows, issue templates, and project scaffolds for student contributors.",
        tags: ["Tooling", "Open Source", "DX"],
        accent: "from-emerald-500/15 via-cyan-500/10 to-transparent",
        icon: Layers3,
    },
    {
        title: "Hack Night Companion",
        summary:
            "A lightweight experience for challenge briefs, team formation, live updates, and demo submissions.",
        tags: ["Hackathon", "Realtime", "UX"],
        accent: "from-amber-500/15 via-orange-500/10 to-transparent",
        icon: FlaskConical,
    },
];

export const events = [
    {
        title: "Design to Deploy",
        type: "Workshop",
        date: "April 18",
        summary:
            "A practical session on responsive layout systems, motion discipline, and shipping clean UI from Figma to code.",
    },
    {
        title: "API Night",
        type: "Build Session",
        date: "April 26",
        summary:
            "A guided sprint on backend patterns, route design, auth, and the club's internal project stack.",
    },
    {
        title: "Hack Day Review",
        type: "Showcase",
        date: "May 03",
        summary:
            "Rapid demos, peer feedback, and a look at the best student-built prototypes from across the club.",
    },
];

export const team = [
    {
        name: "Aarav Sharma",
        role: "Club Lead",
        bio: "Shapes the roadmap, keeps the standards high, and connects projects with student momentum.",
        initials: "AS",
    },
    {
        name: "Ishita Verma",
        role: "Design Lead",
        bio: "Builds the visual language, motion discipline, and overall polish across club experiences.",
        initials: "IV",
    },
    {
        name: "Rohit Mehta",
        role: "Backend Lead",
        bio: "Owns APIs, database structure, and the shared foundations that keep projects reliable.",
        initials: "RM",
    },
    {
        name: "Neha Gupta",
        role: "Community Lead",
        bio: "Runs workshops, onboarding, and event coordination so the club stays active and inclusive.",
        initials: "NG",
    },
];

export const galleryHighlights = [
    {
        title: "Late-night build energy",
        image:
            "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80",
        caption:
            "Teams shipping their first working prototypes after a fast-paced sprint.",
        metric: "1 night",
    },
    {
        title: "Workshop whiteboard wall",
        image:
            "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80",
        caption:
            "Architecture sketches, UI flows, and deployment plans all in one room.",
        metric: "3 tracks",
    },
    {
        title: "Demo day spotlight",
        image:
            "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80",
        caption:
            "Confident pitches, live walkthroughs, and student-built tools on stage.",
        metric: "10 demos",
    },
    {
        title: "Peer review circle",
        image:
            "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=80",
        caption: "Small feedback loops that sharpen design quality and code structure.",
        metric: "2x faster",
    },
];

export const testimonials = [
    {
        quote:
            "The club made web development feel less like theory and more like building something people actually wanted to use.",
        name: "Naman",
        detail: "3rd year CSE, frontend contributor",
    },
    {
        quote:
            "What stood out was the balance of structure and freedom. You get strong guidance, but the ideas stay student-led.",
        name: "Mansi",
        detail: "Design systems and event ops",
    },
    {
        quote:
            "I joined for React and stayed for the culture. Reviews were sharp, feedback was honest, and shipping became a habit.",
        name: "Kartik",
        detail: "Backend + full-stack member",
    },
];

export const joinReasons = [
    "Work on real club projects that reach actual students.",
    "Learn through workshops, reviews, and pair-building.",
    "Contribute as designer, developer, writer, or organizer.",
];

export const socialLinks = [
    { label: "Instagram", href: "#", icon: ArrowUpRight },
    { label: "GitHub", href: "#", icon: ArrowUpRight },
    { label: "LinkedIn", href: "#", icon: ArrowUpRight },
];