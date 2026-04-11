import { useEffect, useMemo, useState } from "react";

import {
    ArrowRight,
    ArrowUpRight,
    CalendarClock,
    ChevronRight,
    Code2,
    Layers3,
    MonitorSmartphone,
    ShieldCheck,
    Sparkles,
    Users2,
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

import { Footer } from "@/components/Footer";
import { Hyperspeed } from "@/components/Hyperspeed";
import { Navbar } from "@/components/Navbar";
import { Reveal } from "@/components/Reveal";
import { SectionHeading } from "@/components/SectionHeading";
import ShinyText from "@/components/ShinyText";
import TextType from "@/components/TextType";
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
    roadWidth: 15,
    islandWidth: 1.6,
    lanesPerRoad: 3,
    fov: 120,
    fovSpeedUp: 160,
    speedUp: 2.25,
    totalSideLightSticks: 34,
    lightPairsPerRoadWay: 70,
    shoulderLinesWidthPercentage: 0.04,
    brokenLinesWidthPercentage: 0.08,
    brokenLinesLengthPercentage: 0.42,
    movingAwaySpeed: [72, 96] as [number, number],
    movingCloserSpeed: [-170, -210] as [number, number],
    carLightsLength: [16, 76] as [number, number],
    carLightsRadius: [0.04, 0.12] as [number, number],
    colors: {
        roadColor: 0x030814,
        islandColor: 0x040a18,
        background: 0x01040b,
        shoulderLines: 0x0b1730,
        brokenLines: 0x0b1730,
        leftCars: [0x6d28d9, 0x4f46e5, 0x8b5cf6],
        rightCars: [0x22d3ee, 0x2563eb, 0x60a5fa],
        sticks: 0x38bdf8,
    },
};

const shellClass =
    "relative overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(5,10,22,0.8),rgba(4,8,18,0.58))] backdrop-blur-xl shadow-[0_34px_120px_-60px_rgba(56,189,248,0.5)]";

const cardClass =
    "relative overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/[0.045] p-5 backdrop-blur-md shadow-[0_24px_80px_-58px_rgba(96,165,250,0.7)]";

const operatingCards = [
    {
        icon: MonitorSmartphone,
        eyebrow: "Build",
        title: "Web products with real users",
        description:
            "Members work on usable portals, internal tools, and public-facing flows instead of isolated practice tasks.",
    },
    {
        icon: Code2,
        eyebrow: "Review",
        title: "Feedback that sharpens every pass",
        description:
            "Design, code, and content get reviewed early so quality improves before anything is treated as done.",
    },
    {
        icon: CalendarClock,
        eyebrow: "Launch",
        title: "Events tied to output",
        description:
            "Workshops and build sprints are meant to produce demos, habits, and momentum rather than static attendance.",
    },
];

const heroWorkflow = [
    {
        icon: Layers3,
        title: "Build lane",
        copy: "A teaser homepage that points to live work instead of dumping every record on the first screen.",
    },
    {
        icon: ShieldCheck,
        title: "Quality lane",
        copy: "Canonical preview selection keeps duplicates out even when the public API returns repeated rows.",
    },
    {
        icon: Sparkles,
        title: "Brand lane",
        copy: "A single Hyperspeed-backed background system now carries the homepage all the way down the scroll.",
    },
];

const teaserCards = [
    {
        icon: MonitorSmartphone,
        title: "Products",
        copy: "Compact previews of the club's actual builds, with links only where a public destination exists.",
    },
    {
        icon: CalendarClock,
        title: "Events",
        copy: "Short, verified upcoming activity cards that feel curated instead of pasted in from another view.",
    },
    {
        icon: Users2,
        title: "People",
        copy: "A small contributor teaser with clearer hierarchy, not a repeated wall of nearly identical member cards.",
    },
];

const projectAccents = [
    "from-cyan-400/20 via-blue-400/12 to-transparent",
    "from-blue-400/16 via-violet-400/12 to-transparent",
    "from-violet-400/18 via-cyan-400/10 to-transparent",
];

function normalizeText(value?: string | number | null) {
    return String(value ?? "")
        .trim()
        .toLowerCase()
        .replace(/\s+/g, " ");
}

function hasText(value?: string | null) {
    return Boolean(value?.trim());
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
    const parts = name
        .trim()
        .split(/\s+/)
        .filter(Boolean);

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
            setAmbientDensity(width >= 1400 ? 40 : width >= 1100 ? 34 : width >= 768 ? 26 : width >= 480 ? 18 : 14);
        };

        syncMotionProfile();
        window.addEventListener("resize", syncMotionProfile);

        return () => {
            window.removeEventListener("resize", syncMotionProfile);
        };
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

    const projectPreview = useMemo(() => canonicalProjects.slice(0, 3), [canonicalProjects]);
    const eventPreview = useMemo(() => canonicalEvents.slice(0, 2), [canonicalEvents]);
    const teamPreview = useMemo(() => canonicalTeam.slice(0, 3), [canonicalTeam]);

    const heroSignals = useMemo(
        () => [
            {
                value: projectsState.loading ? "--" : String(canonicalProjects.length).padStart(2, "0"),
                label: "verified projects",
            },
            {
                value: eventsState.loading ? "--" : String(canonicalEvents.length).padStart(2, "0"),
                label: "upcoming events",
            },
            {
                value: teamState.loading ? "--" : String(canonicalTeam.length).padStart(2, "0"),
                label: "visible contributors",
            },
        ],
        [canonicalEvents.length, canonicalProjects.length, canonicalTeam.length, eventsState.loading, projectsState.loading, teamState.loading],
    );

    return (
        <div id="top" className="relative isolate min-h-screen overflow-x-clip bg-[#02050c] text-white">
            <div className="pointer-events-none fixed inset-0 -z-30">
                {allowAmbientMotion ? (
                    <div className="absolute inset-0 opacity-[0.78] [mask-image:linear-gradient(180deg,transparent_0%,black_8%,black_92%,transparent_100%)]">
                        <Hyperspeed
                            density={ambientDensity}
                            effectOptions={homeHyperspeedOptions}
                            className="scale-[1.08] opacity-100"
                        />
                    </div>
                ) : null}

                <div className="absolute inset-0 bg-[radial-gradient(circle_at_14%_12%,rgba(34,211,238,0.16),transparent_22%),radial-gradient(circle_at_84%_10%,rgba(99,102,241,0.22),transparent_18%),radial-gradient(circle_at_52%_52%,rgba(34,211,238,0.08),transparent_28%),linear-gradient(180deg,rgba(1,4,11,0.18)_0%,rgba(1,4,11,0.44)_36%,rgba(1,4,11,0.76)_100%)]" />
            </div>
            <div className="pointer-events-none fixed inset-0 -z-20 bg-club-grid bg-[size:56px_56px] opacity-[0.05]" />
            <div className="pointer-events-none fixed inset-0 -z-10 bg-[linear-gradient(180deg,rgba(2,6,23,0.56)_0%,rgba(2,6,23,0.18)_14%,rgba(2,6,23,0.3)_34%,rgba(2,6,23,0.48)_58%,rgba(2,6,23,0.78)_100%)]" />

            <Navbar />

            <main className="relative pb-14">
                <section className="mx-auto max-w-[86rem] px-4 pb-6 pt-8 sm:px-6 sm:pb-8 sm:pt-12 lg:px-8 lg:pb-10 lg:pt-16">
                    <div className={`${shellClass} overflow-visible px-5 py-6 sm:px-8 sm:py-8 lg:px-10 lg:py-10`}>
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.16),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(139,92,246,0.12),transparent_28%)]" />
                        <div className="absolute inset-y-10 right-[44%] hidden w-px bg-gradient-to-b from-transparent via-cyan-300/20 to-transparent lg:block" />
                        <motion.div
                            className="pointer-events-none absolute right-6 top-6 hidden rounded-full border border-cyan-300/25 bg-cyan-300/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-100/85 lg:flex"
                            animate={{ y: [0, -6, 0] }}
                            transition={{ duration: 6.8, repeat: Infinity, ease: "easeInOut" }}
                        >
                            Public homepage
                        </motion.div>

                        <div className="relative grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
                            <Reveal className="max-w-4xl">
                                <div className="inline-flex flex-wrap items-center gap-3 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm font-medium text-cyan-100">
                                    <ShinyText
                                        text="Dev Cell IIT Mandi"
                                        speed={4}
                                        color="#cfe7ff"
                                        shineColor="#ffffff"
                                        className="whitespace-nowrap"
                                    />
                                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-300">
                                        React Bits aligned
                                    </span>
                                </div>

                                <h1 className="mt-6 max-w-5xl font-display text-[clamp(2.7rem,7vw,5.7rem)] font-semibold leading-[0.96] tracking-[-0.04em] text-white">
                                    <span className="block">Dev Cell gives IIT Mandi builders the place to</span>
                                    <span className="mt-3 block min-h-[1.15em] bg-gradient-to-r from-cyan-100 via-blue-200 to-violet-200 bg-clip-text text-transparent">
                                        {allowAmbientMotion ? (
                                            <TextType
                                                as="span"
                                                text={["ship real products.", "review like a studio.", "learn through launches."]}
                                                typingSpeed={44}
                                                deletingSpeed={26}
                                                pauseDuration={1450}
                                                cursorClassName="text-cyan-100/90"
                                            />
                                        ) : (
                                            "ship real products."
                                        )}
                                    </span>
                                </h1>

                                <p className="mt-6 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
                                    This front page is now a darker, cleaner teaser for the club: one premium hero, one continuous
                                    branded background language, and one canonical preview source for projects, events, and people.
                                </p>

                                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                                    <a
                                        href="#projects"
                                        className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-cyan-300 px-6 py-3 text-sm font-semibold text-[#04101b] transition hover:-translate-y-0.5 hover:bg-cyan-200"
                                    >
                                        See project previews
                                        <ArrowRight className="h-4 w-4" />
                                    </a>
                                    <a
                                        href="#join"
                                        className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/12 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:border-cyan-300/30 hover:bg-cyan-300/10"
                                    >
                                        Join Dev Cell
                                        <ChevronRight className="h-4 w-4" />
                                    </a>
                                </div>

                                <div className="mt-8 grid gap-3 sm:grid-cols-3">
                                    {heroSignals.map((signal) => (
                                        <div
                                            key={signal.label}
                                            className="rounded-[1.35rem] border border-white/10 bg-white/[0.045] px-4 py-4 backdrop-blur-md"
                                        >
                                            <p className="font-display text-3xl font-semibold tracking-[-0.04em] text-white">{signal.value}</p>
                                            <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-400">{signal.label}</p>
                                        </div>
                                    ))}
                                </div>

                                <p className="mt-5 max-w-2xl text-xs uppercase tracking-[0.2em] text-cyan-100/70">
                                    Verified preview rows only. No merged fallback cards. No repeated homepage dumps.
                                </p>
                            </Reveal>

                            <Reveal delay={0.08}>
                                <div className="relative overflow-hidden rounded-[1.75rem] border border-white/12 bg-[linear-gradient(180deg,rgba(6,10,22,0.82),rgba(4,8,18,0.72))] p-4 shadow-[0_34px_120px_-55px_rgba(59,130,246,0.5)] sm:p-5 lg:p-6">
                                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.18),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(109,40,217,0.14),transparent_26%)]" />
                                    <div className="relative grid gap-4">
                                        <div className="grid gap-4 xl:grid-cols-[1.18fr_0.82fr]">
                                            <div className={cardClass}>
                                                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-100/70">
                                                    Homepage control room
                                                </p>
                                                <h2 className="mt-3 font-display text-[clamp(1.55rem,3vw,2.4rem)] font-semibold leading-tight text-white">
                                                    A finished hero, stable motion, and one visual system across the homepage.
                                                </h2>
                                                <div className="mt-5 space-y-3">
                                                    {heroWorkflow.map((item) => {
                                                        const Icon = item.icon;
                                                        return (
                                                            <div
                                                                key={item.title}
                                                                className="flex items-start gap-3 rounded-[1.2rem] border border-white/10 bg-black/20 px-4 py-3"
                                                            >
                                                                <div className="mt-0.5 rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-2 text-cyan-100">
                                                                    <Icon className="h-4 w-4" />
                                                                </div>
                                                                <div>
                                                                    <p className="text-sm font-semibold text-white">{item.title}</p>
                                                                    <p className="mt-1 text-sm leading-6 text-slate-300">{item.copy}</p>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>

                                            <div className="grid gap-3">
                                                {heroSignals.map((signal) => (
                                                    <div
                                                        key={signal.label}
                                                        className="relative overflow-hidden rounded-[1.2rem] border border-white/10 bg-white/[0.055] px-4 py-4"
                                                    >
                                                        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-200/80 to-transparent" />
                                                        <p className="font-display text-[2rem] font-semibold tracking-[-0.04em] text-white">
                                                            {signal.value}
                                                        </p>
                                                        <p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-400">
                                                            {signal.label}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="grid gap-3 md:grid-cols-3">
                                            {teaserCards.map((item) => {
                                                const Icon = item.icon;
                                                return (
                                                    <div key={item.title} className={cardClass}>
                                                        <div className="rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-2.5 text-cyan-100">
                                                            <Icon className="h-4 w-4" />
                                                        </div>
                                                        <p className="mt-4 font-display text-lg font-semibold text-white">{item.title}</p>
                                                        <p className="mt-2 text-sm leading-6 text-slate-300">{item.copy}</p>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </Reveal>
                        </div>
                    </div>
                </section>

                <section id="about" className="mx-auto max-w-[86rem] px-4 py-3 sm:px-6 lg:px-8">
                    <Reveal>
                        <div className={`${shellClass} p-6 sm:p-8 lg:p-10`}>
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.14),transparent_24%),radial-gradient(circle_at_bottom_left,rgba(34,211,238,0.12),transparent_28%)]" />
                            <div className="relative">
                                <SectionHeading
                                    eyebrow="What Dev Cell Does"
                                    title="Students learn faster when the work looks like shipping."
                                    description="The homepage stays teaser-clean, but the club itself is built around product work, review loops, and events that push members toward actual output."
                                />

                                <div className="mt-8 grid gap-4 lg:grid-cols-3">
                                    {operatingCards.map((item) => {
                                        const Icon = item.icon;
                                        return (
                                            <div key={item.title} className={cardClass}>
                                                <div className="flex items-center gap-3">
                                                    <div className="rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-2.5 text-cyan-100">
                                                        <Icon className="h-5 w-5" />
                                                    </div>
                                                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-100/70">
                                                        {item.eyebrow}
                                                    </p>
                                                </div>
                                                <h3 className="mt-5 font-display text-2xl font-semibold tracking-tight text-white">
                                                    {item.title}
                                                </h3>
                                                <p className="mt-3 text-sm leading-7 text-slate-300">{item.description}</p>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </Reveal>
                </section>
            </main>

            <Footer />
        </div>
    );
}

export default App;
