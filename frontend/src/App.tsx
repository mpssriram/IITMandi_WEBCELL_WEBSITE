import { useEffect, useMemo, useState } from "react";

import {
    ArrowRight,
    ArrowUpRight,
    CalendarClock,
    CheckCircle2,
    Code2,
    Figma,
    Globe,
    Layers3,
    Network,
    Sparkles,
    Users,
} from "lucide-react";
import { useReducedMotion } from "framer-motion";
import { Link } from "react-router-dom";

import { CircularGallery } from "@/components/CircularGallery";
import { ElectricCard } from "@/components/ElectricCard";
import { Footer } from "@/components/Footer";
import { Hyperspeed } from "@/components/Hyperspeed";
import { Navbar } from "@/components/Navbar";
import { Reveal } from "@/components/Reveal";
import { SectionHeading } from "@/components/SectionHeading";
import ShinyText from "@/components/ShinyText";
import { StatCounter } from "@/components/StatCounter";
import { Stack } from "@/components/Stack";
import TextType from "@/components/TextType";
import { HeroVisualPanel } from "@/components/home/HeroVisualPanel";
import { HomeSectionShell } from "@/components/home/HomeSectionShell";
import FaultyTerminal from "@/components/reactbits/FaultyTerminal";
import {
    domains as fallbackDomains,
    events as fallbackEvents,
    galleryHighlights,
    joinReasons,
    projects as fallbackProjects,
    team as fallbackTeam,
} from "@/data/site";
import {
    getPublicEvents,
    getPublicProjects,
    getPublicTeam,
    type PublicEvent,
    type PublicProject,
    type PublicTeamMember,
} from "@/lib/api";
import { normalizeExternalUrl } from "@/lib/collections";

type FetchState<T> = {
    loading: boolean;
    error: string;
    items: T[];
};

const initialFetchState = <T,>(): FetchState<T> => ({
    loading: true,
    error: "",
    items: [],
});

const homeHyperspeedOptions = {
    distortion: "LongRaceDistortion",
    roadWidth: 14,
    islandWidth: 1.35,
    lanesPerRoad: 3,
    fov: 116,
    fovSpeedUp: 140,
    speedUp: 1.9,
    totalSideLightSticks: 34,
    lightPairsPerRoadWay: 74,
    shoulderLinesWidthPercentage: 0.05,
    brokenLinesWidthPercentage: 0.09,
    brokenLinesLengthPercentage: 0.42,
    movingAwaySpeed: [72, 98] as [number, number],
    movingCloserSpeed: [-170, -214] as [number, number],
    carLightsLength: [18, 78] as [number, number],
    carLightsRadius: [0.05, 0.11] as [number, number],
    colors: {
        roadColor: 0x040a16,
        islandColor: 0x071227,
        background: 0x01040b,
        shoulderLines: 0x183960,
        brokenLines: 0x142a48,
        leftCars: [0x38bdf8, 0x60a5fa, 0x818cf8],
        rightCars: [0x67e8f9, 0x22d3ee, 0xa78bfa],
        sticks: 0x67e8f9,
    },
};

const operatingCards = [
    {
        eyebrow: "Learn by shipping",
        title: "Students build products that need structure, iteration, and ownership.",
        description:
            "The club is oriented around product-making rather than disconnected practice tasks. Members move from interface work to full user-facing systems.",
    },
    {
        eyebrow: "Review with intent",
        title: "Feedback loops are part of the workflow, not an afterthought.",
        description:
            "Design critique, code review, and testing discipline help projects mature faster and give newer members a clearer path to improve.",
    },
    {
        eyebrow: "Grow as a team",
        title: "Events, workshops, and hack culture support output instead of replacing it.",
        description:
            "Sessions feed the build pipeline: better practices, stronger collaboration, and more confidence in shipping real work.",
    },
];

const focusAreas = [
    {
        title: "Frontend Engineering",
        copy: "Responsive interfaces, component systems, animation discipline, and accessible interactions.",
        icon: Globe,
    },
    {
        title: "Backend Systems",
        copy: "APIs, auth, data design, and production-minded architecture that supports club products.",
        icon: Network,
    },
    {
        title: "UI / UX Design",
        copy: "Information hierarchy, interface craft, prototypes, and motion that make products feel deliberate.",
        icon: Figma,
    },
    {
        title: "Open Source",
        copy: "Contributing in public, maintaining project quality, and learning how collaborative software evolves.",
        icon: Code2,
    },
    {
        title: "Hackathons and Projects",
        copy: "Sprint-based execution, rapid demos, and project teams that make shipping feel normal.",
        icon: Layers3,
    },
    {
        title: "Community and Mentorship",
        copy: "Peer support, onboarding, and review culture that help members level up consistently.",
        icon: Users,
    },
];

function normalizeText(value?: string | number | null) {
    return String(value ?? "")
        .trim()
        .toLowerCase()
        .replace(/\s+/g, " ");
}

function valueScore(value: unknown) {
    if (typeof value === "string") {
        return value.trim() ? 1 : 0;
    }
    if (typeof value === "number") {
        return 1;
    }
    if (typeof value === "boolean") {
        return value ? 1 : 0;
    }
    return value ? 1 : 0;
}

function completenessScore(item: Record<string, unknown>) {
    return Object.values(item).reduce((score, value) => score + valueScore(value), 0);
}

function compareMaybeDate(first?: string | null, second?: string | null) {
    const firstTime = Date.parse(first || "");
    const secondTime = Date.parse(second || "");
    if (Number.isNaN(firstTime) && Number.isNaN(secondTime)) {
        return 0;
    }
    if (Number.isNaN(firstTime)) {
        return 1;
    }
    if (Number.isNaN(secondTime)) {
        return -1;
    }
    return firstTime - secondTime;
}

function selectCanonicalItems<T extends Record<string, unknown>>(
    items: T[],
    keyBuilder: (item: T) => string,
    compare: (first: T, second: T) => number,
) {
    const byKey = new Map<string, T>();
    items.forEach((item) => {
        const key = keyBuilder(item);
        if (!key) {
            return;
        }
        const existing = byKey.get(key);
        if (!existing || compare(item, existing) < 0) {
            byKey.set(key, item);
        }
    });
    return Array.from(byKey.values()).sort(compare);
}

function projectPreviewKey(project: PublicProject) {
    return [
        normalizeText(project.title),
        normalizeText(project.live_url || project.github_url),
        normalizeText(project.short_description || project.full_description),
        normalizeText(project.display_order),
    ]
        .filter(Boolean)
        .join("|");
}

function eventPreviewKey(eventItem: PublicEvent) {
    return [
        normalizeText(eventItem.title),
        normalizeText(eventItem.date),
        normalizeText(eventItem.venue),
        normalizeText(eventItem.type),
    ]
        .filter(Boolean)
        .join("|");
}

function teamPreviewKey(member: PublicTeamMember) {
    return [
        normalizeText(member.full_name),
        normalizeText(member.role),
        normalizeText(member.team_domain),
        normalizeText(member.year),
    ]
        .filter(Boolean)
        .join("|");
}

function compareProjects(first: PublicProject, second: PublicProject) {
    return (
        Number(second.featured) - Number(first.featured) ||
        (first.display_order ?? Number.MAX_SAFE_INTEGER) - (second.display_order ?? Number.MAX_SAFE_INTEGER) ||
        completenessScore(second) - completenessScore(first) ||
        (second.id ?? 0) - (first.id ?? 0)
    );
}

function compareEvents(first: PublicEvent, second: PublicEvent) {
    return (
        Number(second.featured) - Number(first.featured) ||
        compareMaybeDate(first.date, second.date) ||
        completenessScore(second) - completenessScore(first) ||
        (second.id ?? 0) - (first.id ?? 0)
    );
}

function compareTeam(first: PublicTeamMember, second: PublicTeamMember) {
    return (
        (first.display_order ?? Number.MAX_SAFE_INTEGER) - (second.display_order ?? Number.MAX_SAFE_INTEGER) ||
        completenessScore(second) - completenessScore(first) ||
        normalizeText(first.full_name).localeCompare(normalizeText(second.full_name)) ||
        (second.id ?? 0) - (first.id ?? 0)
    );
}

function splitCommaList(value?: string | null) {
    return (value || "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
        .slice(0, 4);
}

function formatEventDate(dateValue?: string | null) {
    const parsed = new Date(dateValue || "");
    if (Number.isNaN(parsed.getTime())) {
        return "Date TBA";
    }
    return parsed.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
    });
}

function getInitials(name: string) {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (!parts.length) {
        return "TM";
    }
    if (parts.length === 1) {
        return parts[0].slice(0, 2).toUpperCase();
    }
    return `${parts[0][0] || ""}${parts[1][0] || ""}`.toUpperCase();
}

function App() {
    const prefersReducedMotion = useReducedMotion();
    const [allowAmbientMotion, setAllowAmbientMotion] = useState(false);
    const [ambientDensity, setAmbientDensity] = useState(28);
    const [projectsState, setProjectsState] = useState<FetchState<PublicProject>>(initialFetchState);
    const [eventsState, setEventsState] = useState<FetchState<PublicEvent>>(initialFetchState);
    const [teamState, setTeamState] = useState<FetchState<PublicTeamMember>>(initialFetchState);

    useEffect(() => {
        if (typeof window === "undefined") {
            return;
        }
        const syncMotionProfile = () => {
            const width = window.innerWidth;
            setAllowAmbientMotion(!prefersReducedMotion);
            setAmbientDensity(width >= 1400 ? 38 : width >= 1100 ? 30 : width >= 768 ? 22 : 16);
        };
        syncMotionProfile();
        window.addEventListener("resize", syncMotionProfile);
        return () => window.removeEventListener("resize", syncMotionProfile);
    }, [prefersReducedMotion]);

    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            const [projects, events, team] = await Promise.allSettled([
                getPublicProjects(30, 0),
                getPublicEvents(40, 0),
                getPublicTeam(120, 0),
            ]);

            if (cancelled) {
                return;
            }

            setProjectsState({
                loading: false,
                error: projects.status === "rejected" ? "Could not load projects right now." : "",
                items: projects.status === "fulfilled" ? projects.value.items || [] : [],
            });
            setEventsState({
                loading: false,
                error: events.status === "rejected" ? "Could not load events right now." : "",
                items: events.status === "fulfilled" ? events.value.items || [] : [],
            });
            setTeamState({
                loading: false,
                error: team.status === "rejected" ? "Could not load team members right now." : "",
                items: team.status === "fulfilled" ? team.value.items || [] : [],
            });
        };

        load().catch(() => {
            if (cancelled) {
                return;
            }
            setProjectsState({ loading: false, error: "Could not load projects right now.", items: [] });
            setEventsState({ loading: false, error: "Could not load events right now.", items: [] });
            setTeamState({ loading: false, error: "Could not load team members right now.", items: [] });
        });

        return () => {
            cancelled = true;
        };
    }, []);

    const canonicalProjects = useMemo(
        () => selectCanonicalItems(projectsState.items, projectPreviewKey, compareProjects),
        [projectsState.items],
    );
    const canonicalEvents = useMemo(
        () => selectCanonicalItems(eventsState.items, eventPreviewKey, compareEvents),
        [eventsState.items],
    );
    const canonicalTeam = useMemo(
        () => selectCanonicalItems(teamState.items, teamPreviewKey, compareTeam),
        [teamState.items],
    );

    const projectPreview = canonicalProjects.slice(0, 3);
    const eventPreview = canonicalEvents.slice(0, 3);
    const teamPreview = canonicalTeam.slice(0, 4);

    const heroStats = [
        { value: canonicalProjects.length || fallbackProjects.length, suffix: "+", label: "projects and public-facing builds" },
        { value: canonicalEvents.length || fallbackEvents.length, suffix: "+", label: "events, workshops, and sprints" },
        { value: canonicalTeam.length || fallbackTeam.length, suffix: "+", label: "contributors in the visible club network" },
    ];

    const displayProjects = projectPreview.length
        ? projectPreview.map((project) => ({
            id: project.id,
            title: project.title,
            summary: project.short_description || project.full_description || "Project details will be published soon.",
            tags: splitCommaList(project.tech_stack),
            status: project.status || (project.featured ? "Featured" : "Active"),
            href: normalizeExternalUrl(project.live_url) || normalizeExternalUrl(project.github_url) || "",
        }))
        : fallbackProjects.slice(0, 3).map((project, index) => ({
            id: `fallback-project-${index}`,
            title: project.title,
            summary: project.summary,
            tags: project.tags,
            status: "Club initiative",
            href: "",
        }));

    const displayEvents = eventPreview.length
        ? eventPreview.map((eventItem) => ({
            id: eventItem.id,
            title: eventItem.title,
            date: formatEventDate(eventItem.date),
            type: eventItem.type || "Event",
            summary: eventItem.description || "Event details are being updated.",
            venue: eventItem.venue || "IIT Mandi",
        }))
        : fallbackEvents.slice(0, 3).map((eventItem, index) => ({
            id: `fallback-event-${index}`,
            title: eventItem.title,
            date: eventItem.date,
            type: eventItem.type,
            summary: eventItem.summary,
            venue: "IIT Mandi",
        }));

    const displayTeam = teamPreview.length
        ? teamPreview.map((member) => ({
            id: member.id,
            name: member.full_name,
            role: member.role || "Member",
            bio: member.team_domain || member.bio || "Dev Cell contributor",
            badge: member.year || "Member",
        }))
        : fallbackTeam.slice(0, 4).map((member, index) => ({
            id: `fallback-team-${index}`,
            name: member.name,
            role: member.role,
            bio: member.bio,
            badge: "Core",
        }));

    return (
        <div id="top" className="relative isolate min-h-screen overflow-x-clip bg-[#02050c] text-white">
            <div className="pointer-events-none fixed inset-0 -z-30">
                {allowAmbientMotion ? (
                    <div className="absolute inset-0 opacity-[0.7] [mask-image:linear-gradient(180deg,black_0%,black_56%,transparent_100%)]">
                        <Hyperspeed
                            density={ambientDensity}
                            effectOptions={homeHyperspeedOptions}
                            className="scale-[1.01] brightness-110 saturate-125"
                        />
                    </div>
                ) : null}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_14%_8%,rgba(34,211,238,0.16),transparent_24%),radial-gradient(circle_at_88%_12%,rgba(99,102,241,0.16),transparent_22%),linear-gradient(180deg,rgba(1,4,11,0.2)_0%,rgba(1,4,11,0.46)_32%,rgba(1,4,11,0.8)_100%)]" />
            </div>
            <div className="pointer-events-none fixed inset-0 -z-20 bg-club-grid bg-[size:54px_54px] opacity-[0.05]" />
            <div className="pointer-events-none fixed inset-0 -z-10 bg-[linear-gradient(180deg,rgba(2,6,23,0.22)_0%,rgba(2,6,23,0.1)_16%,rgba(2,6,23,0.24)_42%,rgba(2,6,23,0.52)_100%)]" />

            <Navbar />

            <main className="relative pb-14">
                <HomeSectionShell className="pt-6 sm:pt-8 lg:pt-10" innerClassName="p-5 sm:p-8 lg:p-10">
                    <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
                        <Reveal className="max-w-3xl">
                            <div className="inline-flex flex-wrap items-center gap-3 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-[12px] font-medium text-cyan-100">
                                <ShinyText
                                    text="Web Development Club"
                                    speed={4}
                                    color="#d8f5ff"
                                    shineColor="#ffffff"
                                    className="whitespace-nowrap"
                                />
                                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-300">
                                    IIT Mandi
                                </span>
                            </div>

                            <h1 className="mt-6 max-w-3xl font-display text-[clamp(2.4rem,5vw,4.8rem)] font-semibold leading-[0.95] tracking-[-0.05em] text-white">
                                Build serious web products
                                <span className="mt-3 block bg-gradient-to-r from-cyan-100 via-blue-100 to-violet-200 bg-clip-text text-transparent">
                                    with the student builders of IIT Mandi.
                                </span>
                            </h1>

                            <p className="mt-5 max-w-2xl text-[15px] leading-7 text-slate-300 sm:text-base">
                                A project-first club space for engineers, designers, and operators who want to learn
                                through execution, feedback, and real community momentum.
                            </p>

                            <div className="mt-4 min-h-[1.75rem] text-sm font-medium uppercase tracking-[0.18em] text-cyan-100/80 sm:text-[13px]">
                                {allowAmbientMotion ? (
                                    <TextType
                                        as="span"
                                        text={[
                                            "Frontend systems and polished UI.",
                                            "Backend flows and production-minded APIs.",
                                            "Hackathons, reviews, workshops, and launches.",
                                        ]}
                                        typingSpeed={40}
                                        deletingSpeed={24}
                                        pauseDuration={1400}
                                        cursorClassName="text-cyan-100/90"
                                    />
                                ) : (
                                    "Frontend systems, backend workflows, and community-led launches."
                                )}
                            </div>

                            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                                <a
                                    href="#projects"
                                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-cyan-300 px-6 py-3 text-sm font-semibold text-[#04101b] transition hover:-translate-y-0.5 hover:bg-cyan-200"
                                >
                                    Explore club work
                                    <ArrowRight className="h-4 w-4" />
                                </a>
                                <a
                                    href="#join"
                                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/12 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:border-cyan-300/30 hover:bg-cyan-300/10"
                                >
                                    Join the club
                                    <ArrowRight className="h-4 w-4" />
                                </a>
                            </div>
                        </Reveal>

                        <Reveal delay={0.08}>
                            <HeroVisualPanel
                                projectCount={String(canonicalProjects.length || fallbackProjects.length).padStart(2, "0")}
                                eventCount={String(canonicalEvents.length || fallbackEvents.length).padStart(2, "0")}
                                teamCount={String(canonicalTeam.length || fallbackTeam.length).padStart(2, "0")}
                            />
                        </Reveal>
                    </div>

                    <Reveal delay={0.12} className="mt-8">
                        <div className="grid gap-4 md:grid-cols-3">
                            {heroStats.map((stat) => (
                                <StatCounter key={stat.label} value={stat.value} suffix={stat.suffix} label={stat.label} />
                            ))}
                        </div>
                    </Reveal>
                </HomeSectionShell>

                <HomeSectionShell id="about" innerClassName="p-6 sm:p-8 lg:p-10">
                    <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
                        <Reveal>
                            <SectionHeading
                                eyebrow="What We Do"
                                title="A student tech club built around output, craft, and credible teamwork."
                                description="Members learn web development by designing, building, reviewing, and improving real products. The experience is structured enough to build quality, but open enough to let student initiative lead."
                            />
                        </Reveal>

                        <Reveal delay={0.08}>
                            <Stack
                                items={operatingCards.map((item) => ({
                                    id: item.title,
                                    content: (
                                        <div>
                                            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-100/75">
                                                {item.eyebrow}
                                            </p>
                                            <h3 className="mt-3 font-display text-xl font-semibold text-white">
                                                {item.title}
                                            </h3>
                                            <p className="mt-3 text-sm leading-7 text-slate-300">
                                                {item.description}
                                            </p>
                                        </div>
                                    ),
                                }))}
                            />
                        </Reveal>
                    </div>
                </HomeSectionShell>

                <HomeSectionShell innerClassName="p-6 sm:p-8 lg:p-10">
                    <Reveal>
                        <SectionHeading
                            eyebrow="Focus Areas"
                            title="A balanced club stack across engineering, design, and community execution."
                            description="Members can contribute through code, product thinking, visual design, open source, and the culture that keeps projects moving."
                        />
                    </Reveal>

                    <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {[...focusAreas.slice(0, 5), ...fallbackDomains.slice(0, 1)].map((domain, index) => {
                            const Icon = domain.icon;
                            return (
                                <Reveal key={domain.title} delay={0.04 * index}>
                                    <ElectricCard className="h-full p-5">
                                        <div className="flex h-full flex-col">
                                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-300/10 text-cyan-100">
                                                <Icon className="h-5 w-5" />
                                            </div>
                                            <h3 className="mt-5 font-display text-xl font-semibold text-white">
                                                {domain.title}
                                            </h3>
                                            <p className="mt-3 text-sm leading-7 text-slate-300">
                                                {"copy" in domain ? domain.copy : domain.description}
                                            </p>
                                        </div>
                                    </ElectricCard>
                                </Reveal>
                            );
                        })}
                    </div>
                </HomeSectionShell>

                <HomeSectionShell id="projects" innerClassName="p-6 sm:p-8 lg:p-10">
                    <div className="grid gap-8 lg:grid-cols-[0.78fr_1.22fr]">
                        <Reveal>
                            <SectionHeading
                                eyebrow="Featured Work"
                                title="Projects and initiatives presented like real work, not placeholder cards."
                                description="The front page highlights a small set of builds to keep the story focused. When public data is available, the cards update automatically; otherwise curated club initiatives fill the grid."
                            />
                            {projectsState.error ? (
                                <p className="mt-4 rounded-2xl border border-rose-300/25 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
                                    {projectsState.error}
                                </p>
                            ) : null}
                        </Reveal>

                        <div className="grid gap-4 lg:grid-cols-2">
                            {displayProjects.map((project, index) => (
                                <Reveal key={project.id} delay={0.05 * index}>
                                    <ElectricCard className={`${index === 0 ? "lg:col-span-2" : ""} h-full p-5 sm:p-6`}>
                                        <div className="flex h-full flex-col">
                                            <div className="flex flex-wrap items-center justify-between gap-3">
                                                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-100/80">
                                                    {index === 0 ? "Featured initiative" : "Club build"}
                                                </span>
                                                <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-slate-300">
                                                    {project.status}
                                                </span>
                                            </div>

                                            <h3 className="mt-5 font-display text-[clamp(1.35rem,2.4vw,2rem)] font-semibold tracking-tight text-white">
                                                {project.title}
                                            </h3>
                                            <p className="mt-3 text-sm leading-7 text-slate-300 sm:text-[15px]">
                                                {project.summary}
                                            </p>

                                            <div className="mt-5 flex flex-wrap gap-2">
                                                {project.tags.map((tag) => (
                                                    <span
                                                        key={tag}
                                                        className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-medium text-slate-200"
                                                    >
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>

                                            <div className="mt-auto pt-8">
                                                {project.href ? (
                                                    <a
                                                        href={project.href}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-100 transition hover:text-white"
                                                    >
                                                        View project
                                                        <ArrowUpRight className="h-4 w-4" />
                                                    </a>
                                                ) : (
                                                    <span className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400">
                                                        Club showcase item
                                                        <ArrowRight className="h-4 w-4" />
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </ElectricCard>
                                </Reveal>
                            ))}
                        </div>
                    </div>
                </HomeSectionShell>

                <HomeSectionShell id="events" innerClassName="p-6 sm:p-8 lg:p-10">
                    <div className="grid gap-8 lg:grid-cols-[0.92fr_1.08fr] lg:items-start">
                        <Reveal>
                            <SectionHeading
                                eyebrow="Events and Workshops"
                                title="A dynamic section that feels active without becoming visual noise."
                                description="Talks, workshops, hack sprints, and reviews are positioned as part of the club operating rhythm. The technical display keeps the section feeling live and unmistakably engineering-focused."
                            />
                            {eventsState.error ? (
                                <p className="mt-4 rounded-2xl border border-rose-300/25 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
                                    {eventsState.error}
                                </p>
                            ) : null}

                            <div className="mt-6 overflow-hidden rounded-[1.7rem] border border-white/10 bg-[#020611]">
                                <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 text-[11px] uppercase tracking-[0.22em] text-slate-400">
                                    <span>Event signal</span>
                                    <span>Reactbits terminal</span>
                                </div>
                                <div className="h-[18rem] sm:h-[20rem]">
                                    <FaultyTerminal
                                        scale={1.25}
                                        gridMul={[3, 2]}
                                        digitSize={1.3}
                                        tint="#8de6ff"
                                        brightness={0.8}
                                        noiseAmp={1.2}
                                        scanlineIntensity={0.35}
                                        mouseStrength={0.12}
                                        chromaticAberration={0.4}
                                        className="h-full w-full"
                                    />
                                </div>
                            </div>
                        </Reveal>

                        <div className="grid gap-4">
                            {displayEvents.map((eventItem, index) => (
                                <Reveal key={eventItem.id} delay={0.05 * index}>
                                    <ElectricCard className="p-5">
                                        <div className="grid gap-5 md:grid-cols-[auto_1fr] md:items-start">
                                            <div className="flex items-center gap-3 md:block">
                                                <div className="grid h-12 w-12 place-items-center rounded-2xl border border-cyan-300/20 bg-cyan-300/10 text-cyan-100">
                                                    <CalendarClock className="h-5 w-5" />
                                                </div>
                                                <div className="md:mt-4">
                                                    <p className="text-[11px] uppercase tracking-[0.22em] text-slate-400">
                                                        {eventItem.date}
                                                    </p>
                                                    <p className="mt-1 text-sm font-medium text-cyan-100/80">
                                                        {eventItem.type}
                                                    </p>
                                                </div>
                                            </div>

                                            <div>
                                                <div className="flex flex-wrap items-center justify-between gap-3">
                                                    <h3 className="font-display text-xl font-semibold text-white">
                                                        {eventItem.title}
                                                    </h3>
                                                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-slate-300">
                                                        {eventItem.venue}
                                                    </span>
                                                </div>
                                                <p className="mt-3 text-sm leading-7 text-slate-300">
                                                    {eventItem.summary}
                                                </p>
                                            </div>
                                        </div>
                                    </ElectricCard>
                                </Reveal>
                            ))}
                        </div>
                    </div>
                </HomeSectionShell>

                <HomeSectionShell innerClassName="p-6 sm:p-8 lg:p-10">
                    <div className="grid gap-8 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
                        <Reveal>
                            <SectionHeading
                                eyebrow="Why Join"
                                title="A clear path from curiosity to capable contribution."
                                description="Members gain mentorship, real collaboration, and habits that transfer directly into internships, hackathons, and stronger personal work."
                            />

                            <div className="mt-6 space-y-3">
                                {joinReasons.map((reason) => (
                                    <div
                                        key={reason}
                                        className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-4"
                                    >
                                        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-cyan-200" />
                                        <p className="text-sm leading-7 text-slate-200">{reason}</p>
                                    </div>
                                ))}
                            </div>
                        </Reveal>

                        <div className="grid gap-4 md:grid-cols-2">
                            {[
                                {
                                    title: "Mentorship and review",
                                    copy: "New members get context faster through structured critique, shared patterns, and guidance from seniors.",
                                    icon: Sparkles,
                                },
                                {
                                    title: "Real project exposure",
                                    copy: "Club products create opportunities to think beyond tutorials and build for actual users and flows.",
                                    icon: Layers3,
                                },
                                {
                                    title: "Peer-driven learning",
                                    copy: "The community teaches through collaboration, demos, documentation, and fast iteration cycles.",
                                    icon: Users,
                                },
                                {
                                    title: "Hackathon readiness",
                                    copy: "Members build confidence in working under time pressure, presenting ideas, and shipping cohesive work.",
                                    icon: Code2,
                                },
                            ].map((item, index) => {
                                const Icon = item.icon;
                                return (
                                    <Reveal key={item.title} delay={0.04 * index}>
                                        <ElectricCard className="h-full p-5">
                                            <div className="flex h-full flex-col">
                                                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-300/10 text-cyan-100">
                                                    <Icon className="h-5 w-5" />
                                                </div>
                                                <h3 className="mt-4 font-display text-lg font-semibold text-white">
                                                    {item.title}
                                                </h3>
                                                <p className="mt-3 text-sm leading-7 text-slate-300">
                                                    {item.copy}
                                                </p>
                                            </div>
                                        </ElectricCard>
                                    </Reveal>
                                );
                            })}
                        </div>
                    </div>
                </HomeSectionShell>

                <HomeSectionShell id="team" innerClassName="p-6 sm:p-8 lg:p-10">
                    <div className="grid gap-8 xl:grid-cols-[0.84fr_1.16fr] xl:items-center">
                        <Reveal>
                            <SectionHeading
                                eyebrow="Community Highlight"
                                title="The club should feel like a serious team, not a disconnected audience."
                                description="This section combines contributor visibility with a more human snapshot of workshop rooms, sprint energy, and demo culture."
                            />

                            {teamState.error ? (
                                <p className="mt-4 rounded-2xl border border-rose-300/25 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
                                    {teamState.error}
                                </p>
                            ) : null}

                            <div className="mt-6 grid gap-4 sm:grid-cols-2">
                                {displayTeam.map((member) => (
                                    <ElectricCard key={member.id} className="p-5">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="grid h-12 w-12 place-items-center rounded-2xl border border-cyan-300/20 bg-cyan-300/10 font-display text-sm font-semibold text-white">
                                                {getInitials(member.name || "TM")}
                                            </div>
                                            <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-slate-300">
                                                {member.badge}
                                            </span>
                                        </div>
                                        <h3 className="mt-4 font-display text-lg font-semibold text-white">
                                            {member.name}
                                        </h3>
                                        <p className="mt-1 text-sm font-medium text-cyan-100/80">
                                            {member.role}
                                        </p>
                                        <p className="mt-3 text-sm leading-7 text-slate-300">
                                            {member.bio}
                                        </p>
                                    </ElectricCard>
                                ))}
                            </div>
                        </Reveal>

                        <Reveal delay={0.08}>
                            <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-4 sm:p-6">
                                <CircularGallery items={galleryHighlights} />
                            </div>
                        </Reveal>
                    </div>
                </HomeSectionShell>

                <HomeSectionShell
                    id="join"
                    className="pb-0"
                    innerClassName="p-6 sm:p-8 lg:p-10"
                    glowClassName="bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.2),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(109,40,217,0.18),transparent_26%)]"
                >
                    <Reveal>
                        <div className="grid gap-6 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
                            <div>
                                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-100/80">
                                    Final CTA
                                </p>
                                <h2 className="mt-3 max-w-3xl font-display text-[clamp(1.9rem,4vw,3.3rem)] font-semibold tracking-[-0.04em] text-white">
                                    Join a club culture that treats shipping, design quality, and collaboration seriously.
                                </h2>
                                <p className="mt-4 max-w-2xl text-[15px] leading-7 text-slate-200">
                                    Create an account to access the member experience, events, and resources. If you are
                                    exploring first, the homepage now gives a much clearer picture of how the club works
                                    and what it values.
                                </p>
                            </div>

                            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                                <Link
                                    to="/signup"
                                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-cyan-300 px-6 py-3 text-sm font-semibold text-[#04101b] transition hover:-translate-y-0.5 hover:bg-cyan-200"
                                >
                                    Create account
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                                <Link
                                    to="/login"
                                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:border-cyan-300/30 hover:bg-white/10"
                                >
                                    Member login
                                </Link>
                            </div>
                        </div>
                    </Reveal>
                </HomeSectionShell>
            </main>

            <Footer />
        </div>
    );
}

export default App;
