import { useEffect, useMemo, useState } from "react";

import { ArrowRight, ArrowUpRight, ChevronRight, Code2, MonitorSmartphone, Rocket, ShieldCheck, Sparkles, Users2 } from "lucide-react";
import { motion } from "framer-motion";

import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { Reveal } from "@/components/Reveal";
import { SectionHeading } from "@/components/SectionHeading";
import { StatCounter } from "@/components/StatCounter";
import {
    clubHighlights,
    domains,
    galleryHighlights,
    heroStats,
    joinReasons,
    testimonials,
} from "@/data/site";
import {
    getPublicEvents,
    getPublicProjects,
    getPublicTeam,
    submitJoinApplication,
    type JoinPayload,
    type PublicEvent,
    type PublicProject,
    type PublicTeamMember,
} from "@/lib/api";

const sectionCardClass =
    "group relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/[0.045] p-5 shadow-[0_24px_80px_-40px_rgba(0,0,0,0.65)] backdrop-blur-sm transition-all duration-500 hover:-translate-y-1.5 hover:border-cyan-300/45 hover:bg-white/[0.08] hover:shadow-[0_28px_90px_-40px_rgba(6,182,212,0.45)] before:pointer-events-none before:absolute before:inset-0 before:bg-[linear-gradient(135deg,rgba(255,255,255,0.12),transparent_35%,transparent_70%,rgba(103,232,249,0.08))] before:opacity-0 before:transition-opacity before:duration-500 hover:before:opacity-100";

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

const emptyJoinForm: JoinPayload = {
    name: "",
    email: "",
    year: "",
    interest: "",
    message: "",
};

function formatEventDate(dateValue: string) {
    const parsed = new Date(dateValue);
    if (Number.isNaN(parsed.getTime())) {
        return dateValue;
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
    const [teamState, setTeamState] = useState<FetchState<PublicTeamMember>>(initialFetchState);
    const [eventsState, setEventsState] = useState<FetchState<PublicEvent>>(initialFetchState);
    const [projectsState, setProjectsState] = useState<FetchState<PublicProject>>(initialFetchState);

    const [joinForm, setJoinForm] = useState<JoinPayload>(emptyJoinForm);
    const [joinSubmitting, setJoinSubmitting] = useState(false);
    const [joinMessage, setJoinMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    useEffect(() => {
        let cancelled = false;

        const loadTeam = async () => {
            try {
                const response = await getPublicTeam();
                if (cancelled) {
                    return;
                }
                setTeamState({ loading: false, error: "", items: response.items || [] });
            } catch (error) {
                if (cancelled) {
                    return;
                }
                setTeamState({ loading: false, error: "Failed to load team.", items: [] });
            }
        };

        const loadEvents = async () => {
            try {
                const response = await getPublicEvents();
                if (cancelled) {
                    return;
                }
                setEventsState({ loading: false, error: "", items: response.items || [] });
            } catch (error) {
                if (cancelled) {
                    return;
                }
                setEventsState({ loading: false, error: "Failed to load events.", items: [] });
            }
        };

        const loadProjects = async () => {
            try {
                const response = await getPublicProjects();
                if (cancelled) {
                    return;
                }
                setProjectsState({ loading: false, error: "", items: response.items || [] });
            } catch (error) {
                if (cancelled) {
                    return;
                }
                setProjectsState({ loading: false, error: "Failed to load projects.", items: [] });
            }
        };

        loadTeam();
        loadEvents();
        loadProjects();

        return () => {
            cancelled = true;
        };
    }, []);

    const displayedProjects = useMemo(() => projectsState.items.slice(0, 4), [projectsState.items]);
    const displayedEvents = useMemo(() => eventsState.items.slice(0, 3), [eventsState.items]);
    const displayedTeam = useMemo(() => teamState.items.slice(0, 8), [teamState.items]);

    const handleJoinChange = (field: keyof JoinPayload, value: string) => {
        setJoinForm((current) => ({ ...current, [field]: value }));
    };

    const handleJoinSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setJoinMessage(null);

        if (!joinForm.name?.trim() || !joinForm.email?.trim()) {
            setJoinMessage({ type: "error", text: "Name and email are required." });
            return;
        }

        setJoinSubmitting(true);
        try {
            const response = await submitJoinApplication(joinForm);
            setJoinMessage({ type: "success", text: response.message || "Application submitted." });
            setJoinForm(emptyJoinForm);
        } catch (error) {
            setJoinMessage({ type: "error", text: "Failed to submit. Please try again." });
        } finally {
            setJoinSubmitting(false);
        }
    };

    return (
        <div id="top" className="relative isolate min-h-screen overflow-x-clip bg-ink-950 text-white">
            <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.16),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(14,165,233,0.14),_transparent_24%),linear-gradient(180deg,_#050816_0%,_#050816_45%,_#080d1a_100%)]" />
            <div className="pointer-events-none absolute inset-0 -z-10 bg-club-grid bg-[size:48px_48px] opacity-[0.12]" />

            <Navbar />

            <main className="pb-6 sm:pb-8">
                <section className="relative mx-auto max-w-[84rem] px-4 pb-14 pt-10 sm:px-6 sm:pb-16 sm:pt-16 lg:px-8 lg:pb-24 lg:pt-24 2xl:max-w-[90rem]">
                    <motion.div
                        className="pointer-events-none absolute right-8 top-8 hidden rounded-full border border-cyan-300/30 bg-cyan-300/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-100/90 lg:block"
                        animate={{ y: [0, -8, 0] }}
                        transition={{ duration: 6.5, repeat: Infinity, ease: "easeInOut" }}
                    >
                        Build. Review. Ship.
                    </motion.div>
                    <motion.div
                        className="pointer-events-none absolute left-[46%] top-20 hidden h-3 w-3 rounded-full bg-cyan-300/70 lg:block"
                        animate={{ scale: [1, 1.35, 1], opacity: [0.7, 1, 0.7] }}
                        transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
                    />

                    <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-12">
                        <Reveal className="max-w-3xl">
                            <div className="inline-flex min-h-11 items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm font-medium text-cyan-100">
                                <Sparkles className="h-4 w-4" />
                                Premium web experiences for student builders
                            </div>

                            <h1 className="mt-6 max-w-4xl font-display text-[clamp(2rem,6.8vw,5.1rem)] font-semibold leading-[1.03] tracking-tight text-white">
                                A web club that feels like
                                <span className="bg-gradient-to-r from-cyan-200 via-cyan-300 to-sky-300 bg-clip-text text-transparent">
                                    {" "}a product studio.
                                </span>
                            </h1>

                            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg sm:leading-8">
                                Dev Cell at IIT Mandi builds polished interfaces, dependable systems, and collaborative learning spaces for students who want to ship real things. The website mirrors that mindset: clean, interactive, and ready to grow.
                            </p>

                            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                                <a
                                    href="#join"
                                    className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-cyan-400 px-6 py-3 text-sm font-semibold text-ink-950 transition hover:-translate-y-0.5 hover:bg-cyan-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-950 sm:w-auto"
                                >
                                    Join the team
                                    <ArrowRight className="h-4 w-4" />
                                </a>
                                <a
                                    href="#projects"
                                    className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:border-cyan-400/30 hover:bg-cyan-400/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-950 sm:w-auto"
                                >
                                    Explore projects
                                    <ChevronRight className="h-4 w-4" />
                                </a>
                            </div>

                            <div className="mt-8 flex flex-wrap gap-2.5 sm:gap-3">
                                {clubHighlights.map((item) => (
                                    <span
                                        key={item}
                                        className="max-w-full rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300"
                                    >
                                        {item}
                                    </span>
                                ))}
                            </div>
                        </Reveal>

                        <Reveal delay={0.08} className="relative">
                            <div className="absolute -left-8 top-10 h-32 w-32 rounded-full bg-cyan-400/15 blur-3xl" />
                            <div className="absolute -right-10 bottom-10 h-40 w-40 rounded-full bg-sky-500/10 blur-3xl" />

                            <div className="relative rounded-[2rem] border border-white/10 bg-white/5 p-4 shadow-glow backdrop-blur-md sm:p-6">
                                <div className="absolute inset-0 rounded-[2rem] bg-[linear-gradient(135deg,rgba(255,255,255,0.12),transparent_22%,transparent_78%,rgba(255,255,255,0.08))] opacity-60" />

                                <div className="relative overflow-hidden rounded-[1.5rem] border border-white/10 bg-gradient-to-br from-ink-900 via-ink-800 to-black p-5 sm:p-6">
                                    <div className="flex flex-wrap items-start justify-between gap-4">
                                        <div>
                                            <p className="text-xs uppercase tracking-[0.24em] text-cyan-100/70">Upcoming build cycle</p>
                                            <h2 className="mt-2 font-display text-2xl font-semibold text-white">Design to Deploy</h2>
                                        </div>
                                        <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-3 py-2 text-right">
                                            <p className="text-[10px] uppercase tracking-[0.24em] text-cyan-100/70">Mode</p>
                                            <p className="font-semibold text-cyan-100">Hands-on</p>
                                        </div>
                                    </div>

                                    <div className="mt-6 grid gap-4 sm:grid-cols-2">
                                        <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                                            <MonitorSmartphone className="h-5 w-5 text-cyan-300" />
                                            <p className="mt-4 text-sm font-semibold text-white">Responsive systems</p>
                                            <p className="mt-2 text-sm leading-6 text-slate-300">
                                                Layouts that collapse cleanly and still feel deliberate on phones.
                                            </p>
                                        </div>
                                        <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                                            <Code2 className="h-5 w-5 text-cyan-300" />
                                            <p className="mt-4 text-sm font-semibold text-white">Real code review</p>
                                            <p className="mt-2 text-sm leading-6 text-slate-300">
                                                Practical feedback on structure, naming, and shipping quality.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-6 rounded-3xl border border-white/10 bg-black/30 p-4">
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm font-medium text-slate-300">Prototype progress</p>
                                            <p className="text-sm font-semibold text-cyan-100">78%</p>
                                        </div>
                                        <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                                            <motion.div
                                                className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-sky-400 to-teal-300"
                                                initial={{ width: "0%" }}
                                                animate={{ width: "78%" }}
                                                transition={{ duration: 1.2, ease: "easeOut" }}
                                            />
                                        </div>
                                    </div>

                                    <div className="mt-6 grid gap-3 sm:grid-cols-3">
                                        {[
                                            { label: "Projects", value: "35+" },
                                            { label: "Workshops", value: "18+" },
                                            { label: "Active tracks", value: "7" },
                                        ].map((item) => (
                                            <div key={item.label} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 sm:min-h-[84px]">
                                                <p className="font-display text-xl font-semibold text-white">{item.value}</p>
                                                <p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-400">{item.label}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </Reveal>
                    </div>

                    <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        {heroStats.map((stat) => (
                            <StatCounter key={stat.label} value={stat.value} suffix={stat.suffix} label={stat.label} />
                        ))}
                    </div>
                </section>

                <section id="about" className="mx-auto max-w-[84rem] border-t border-white/5 px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-24 2xl:max-w-[90rem]">
                    <Reveal>
                        <SectionHeading
                            eyebrow="About"
                            title="A club built around learning by shipping."
                            description="We focus on practical web development, collaborative design, and reliable delivery. Every event, project, and team effort is meant to grow both skill and confidence, while keeping the experience student-friendly and high quality."
                        />
                    </Reveal>

                    <div className="mt-10 grid gap-5 lg:grid-cols-3">
                        {[
                            {
                                icon: ShieldCheck,
                                title: "Clear standards",
                                text: "Readable code, strong design hierarchy, accessibility, and responsive behavior are part of the baseline.",
                            },
                            {
                                icon: Users2,
                                title: "Community first",
                                text: "We create a place where first-year members and senior contributors can learn together without gatekeeping.",
                            },
                            {
                                icon: Sparkles,
                                title: "Premium output",
                                text: "The club identity should feel modern, intentional, and polished enough to represent IIT Mandi with confidence.",
                            },
                        ].map((item, index) => (
                            <Reveal key={item.title} delay={index * 0.08} className={sectionCardClass}>
                                <item.icon className="h-6 w-6 text-cyan-300" />
                                <h3 className="mt-5 font-display text-xl font-semibold text-white">{item.title}</h3>
                                <p className="mt-3 text-sm leading-7 text-slate-300">{item.text}</p>
                            </Reveal>
                        ))}
                    </div>
                </section>

                <section id="tracks" className="mx-auto max-w-[84rem] border-t border-white/5 px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-24 2xl:max-w-[90rem]">
                    <Reveal>
                        <SectionHeading
                            eyebrow="Domains"
                            title="Tracks that cover the full web product stack."
                            description="The club is intentionally broad. Members can go deep in frontend, backend, design, ops, or product thinking, while still collaborating on one shared standard of quality."
                        />
                    </Reveal>

                    <div className="mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                        {domains.map((domain, index) => (
                            <Reveal key={domain.title} delay={index * 0.05} className={sectionCardClass}>
                                <domain.icon className="h-6 w-6 text-cyan-300" />
                                <h3 className="mt-5 font-display text-xl font-semibold text-white">{domain.title}</h3>
                                <p className="mt-3 text-sm leading-7 text-slate-300">{domain.description}</p>
                                <div className="mt-5 flex flex-wrap gap-2">
                                    {domain.bullets.map((bullet) => (
                                        <span
                                            key={bullet}
                                            className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs font-medium text-slate-300"
                                        >
                                            {bullet}
                                        </span>
                                    ))}
                                </div>
                            </Reveal>
                        ))}
                    </div>
                </section>

                <section id="projects" className="mx-auto max-w-[84rem] border-t border-white/5 px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-24 2xl:max-w-[90rem]">
                    <Reveal>
                        <SectionHeading
                            eyebrow="Projects"
                            title="Featured work that looks and behaves like a real product."
                            description="The project showcase leans into useful UI patterns: clear hierarchy, strong cards, small motion moments, and enough space for both story and detail."
                        />
                    </Reveal>

                    <div className="mt-10 grid gap-5 lg:grid-cols-2">
                        {projectsState.loading ? (
                            Array.from({ length: 2 }).map((_, index) => (
                                <div key={index} className="rounded-[1.9rem] border border-white/10 bg-white/5 p-6">
                                    <div className="h-4 w-20 animate-pulse rounded bg-white/10" />
                                    <div className="mt-5 h-7 w-2/3 animate-pulse rounded bg-white/10" />
                                    <div className="mt-4 h-16 animate-pulse rounded bg-white/10" />
                                </div>
                            ))
                        ) : null}

                        {!projectsState.loading && projectsState.error ? (
                            <div className="rounded-[1.9rem] border border-rose-300/30 bg-rose-400/10 p-6 text-sm text-rose-100 lg:col-span-2">
                                {projectsState.error}
                            </div>
                        ) : null}

                        {!projectsState.loading && !projectsState.error && !displayedProjects.length ? (
                            <div className="rounded-[1.9rem] border border-white/10 bg-white/5 p-6 text-sm text-slate-300 lg:col-span-2">
                                No projects have been published yet.
                            </div>
                        ) : null}

                        {!projectsState.loading && !projectsState.error
                            ? displayedProjects.map((project, index) => {
                                const projectStatus = project.status || "active";
                                const tags = [projectStatus, project.tech_stack, project.current_lead]
                                    .filter(Boolean)
                                    .slice(0, 3) as string[];

                                return (
                                    <Reveal
                                        key={project.id}
                                        delay={index * 0.05}
                                        className="group min-w-0 rounded-[1.9rem] border border-white/10 bg-white/5 p-5 transition duration-300 hover:-translate-y-1 hover:border-cyan-400/30 hover:bg-white/[0.07] sm:p-6"
                                    >
                                        <div className="relative rounded-[1.5rem] border border-white/10 bg-gradient-to-br from-cyan-500/20 via-sky-500/10 to-transparent p-5">
                                            <div className="flex items-start justify-between gap-4">
                                                <div>
                                                    <Rocket className="h-6 w-6 text-cyan-200 transition-transform duration-500 group-hover:rotate-3 group-hover:scale-105" />
                                                    <h3 className="mt-5 break-words font-display text-2xl font-semibold text-white">{project.title}</h3>
                                                </div>
                                                <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-slate-300">
                                                    {project.featured ? "Featured" : "Project"}
                                                </span>
                                            </div>

                                            <p className="mt-4 max-w-xl break-words text-sm leading-7 text-slate-200">
                                                {project.short_description || project.full_description || "Project from the Dev Cell showcase."}
                                            </p>

                                            <div className="mt-5 flex flex-wrap gap-2">
                                                {tags.length
                                                    ? tags.map((tag) => (
                                                        <span key={tag} className="rounded-full bg-black/20 px-3 py-1 text-xs font-medium text-slate-100">
                                                            {tag}
                                                        </span>
                                                    ))
                                                    : <span className="rounded-full bg-black/20 px-3 py-1 text-xs font-medium text-slate-100">resource</span>}
                                            </div>

                                            <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4">
                                                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Project</span>
                                                {(project.live_url || project.github_url) ? (
                                                    <a
                                                        href={project.live_url || project.github_url || "#"}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-100 transition group-hover:text-cyan-50"
                                                    >
                                                        Open
                                                        <ArrowUpRight className="h-4 w-4 transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                                                    </a>
                                                ) : (
                                                    <span className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-100 transition group-hover:text-cyan-50">
                                                        Details
                                                        <ArrowUpRight className="h-4 w-4 transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </Reveal>
                                );
                            })
                            : null}
                    </div>
                </section>

                <section id="events" className="mx-auto max-w-[84rem] border-t border-white/5 px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-24 2xl:max-w-[90rem]">
                    <Reveal>
                        <SectionHeading
                            eyebrow="Events"
                            title="Workshops and showcases that keep the club moving."
                            description="The event format is built for momentum: short feedback loops, practical sessions, and just enough ceremony to make each gathering memorable."
                        />
                    </Reveal>

                    <div className="mt-10 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
                        <Reveal className="rounded-[1.9rem] border border-white/10 bg-white/5 p-6">
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <p className="text-sm uppercase tracking-[0.22em] text-cyan-200/80">Live cadence</p>
                                    <h3 className="mt-2 font-display text-2xl font-semibold text-white">Monthly build rhythm</h3>
                                </div>
                                <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm font-semibold text-cyan-100">
                                    Weekly touchpoints
                                </div>
                            </div>

                            <div className="mt-6 space-y-4">
                                {eventsState.loading ? (
                                    Array.from({ length: 2 }).map((_, index) => (
                                        <div key={index} className="rounded-3xl border border-white/10 bg-black/20 p-5">
                                            <div className="h-5 w-24 animate-pulse rounded bg-white/10" />
                                            <div className="mt-3 h-6 w-3/4 animate-pulse rounded bg-white/10" />
                                            <div className="mt-3 h-12 animate-pulse rounded bg-white/10" />
                                        </div>
                                    ))
                                ) : null}

                                {!eventsState.loading && eventsState.error ? (
                                    <div className="rounded-3xl border border-rose-300/30 bg-rose-400/10 p-5 text-sm text-rose-100">
                                        {eventsState.error}
                                    </div>
                                ) : null}

                                {!eventsState.loading && !eventsState.error && !displayedEvents.length ? (
                                    <div className="rounded-3xl border border-white/10 bg-black/20 p-5 text-sm text-slate-300">
                                        No events are published right now.
                                    </div>
                                ) : null}

                                {!eventsState.loading && !eventsState.error
                                    ? displayedEvents.map((event) => (
                                        <article
                                            key={event.id}
                                            className="rounded-3xl border border-white/10 bg-black/20 p-5 transition hover:border-cyan-400/25 hover:bg-black/25"
                                        >
                                            <div className="flex flex-wrap items-center justify-between gap-3">
                                                <div>
                                                    <p className="text-xs uppercase tracking-[0.22em] text-cyan-200/70">{event.organizers || event.type || "Event"}</p>
                                                    <h4 className="mt-1 font-display text-xl font-semibold text-white">{event.title}</h4>
                                                </div>
                                                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-slate-200">
                                                    {event.date ? formatEventDate(event.date) : "TBA"}
                                                </span>
                                            </div>
                                            <p className="mt-3 text-sm leading-7 text-slate-300">{event.description}</p>
                                        </article>
                                    ))
                                    : null}
                            </div>
                        </Reveal>

                        <div className="grid gap-5">
                            <Reveal className={sectionCardClass}>
                                <p className="text-sm uppercase tracking-[0.22em] text-cyan-200/80">Format</p>
                                <h3 className="mt-2 font-display text-2xl font-semibold text-white">What to expect</h3>
                                <div className="mt-5 space-y-3">
                                    {[
                                        "Live demos with concrete takeaways.",
                                        "Micro-workshops focused on one useful skill.",
                                        "Room for questions, pair work, and reviews.",
                                        "A finish that points directly to what comes next.",
                                    ].map((item) => (
                                        <div key={item} className="flex items-start gap-3 text-sm text-slate-300">
                                            <span className="mt-2 h-2 w-2 rounded-full bg-cyan-300" />
                                            <span>{item}</span>
                                        </div>
                                    ))}
                                </div>
                            </Reveal>

                            <Reveal className={sectionCardClass}>
                                <p className="text-sm uppercase tracking-[0.22em] text-cyan-200/80">Momentum</p>
                                <h3 className="mt-2 font-display text-2xl font-semibold text-white">Healthy cadence, not burnout</h3>
                                <p className="mt-3 text-sm leading-7 text-slate-300">
                                    The website should reflect the club culture: energetic, but not noisy; polished, but not overproduced.
                                </p>
                            </Reveal>
                        </div>
                    </div>
                </section>

                <section id="team" className="mx-auto max-w-[84rem] border-t border-white/5 px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-24 2xl:max-w-[90rem]">
                    <Reveal>
                        <SectionHeading
                            eyebrow="Team"
                            title="People behind the work."
                            description="Polished team presentation matters for trust. These cards are built to feel editorial and responsive, with enough structure for future bios, roles, and links."
                        />
                    </Reveal>

                    <div className="mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                        {teamState.loading ? (
                            Array.from({ length: 4 }).map((_, index) => (
                                <div key={index} className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
                                    <div className="h-16 w-16 animate-pulse rounded-2xl bg-white/10" />
                                    <div className="mt-4 h-5 w-2/3 animate-pulse rounded bg-white/10" />
                                    <div className="mt-2 h-4 w-1/2 animate-pulse rounded bg-white/10" />
                                </div>
                            ))
                        ) : null}

                        {!teamState.loading && teamState.error ? (
                            <div className="rounded-[1.75rem] border border-rose-300/30 bg-rose-400/10 p-5 text-sm text-rose-100 sm:col-span-2 xl:col-span-4">
                                {teamState.error}
                            </div>
                        ) : null}

                        {!teamState.loading && !teamState.error && !displayedTeam.length ? (
                            <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5 text-sm text-slate-300 sm:col-span-2 xl:col-span-4">
                                Team members will appear here once added from admin.
                            </div>
                        ) : null}

                        {!teamState.loading && !teamState.error
                            ? displayedTeam.map((member, index) => (
                                <Reveal key={member.id} delay={index * 0.05} className={`${sectionCardClass} group`}>
                                    <div className="flex min-w-0 items-center gap-4">
                                        <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl border border-cyan-400/20 bg-gradient-to-br from-cyan-400/20 to-white/5 font-display text-xl font-semibold text-white transition group-hover:scale-105">
                                            {getInitials(member.full_name || "TM")}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="truncate font-display text-lg font-semibold text-white">{member.full_name}</p>
                                            <p className="inline-flex w-fit rounded-full border border-white/10 bg-black/20 px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-cyan-200">{member.role || "Member"}</p>
                                        </div>
                                    </div>
                                    <p className="mt-4 text-sm leading-7 text-slate-300">{member.bio || "Core contributor in the Dev Cell public team."}</p>
                                    <div className="mt-6 border-t border-white/10 pt-4">
                                        {member.linkedin_url || member.github_url ? (
                                            <a
                                                href={member.linkedin_url || member.github_url || "#"}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="inline-flex items-center gap-2 text-sm font-semibold text-slate-200 transition group-hover:text-cyan-100"
                                            >
                                                Profile
                                                <ArrowUpRight className="h-4 w-4 transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                                            </a>
                                        ) : (
                                            <span className="inline-flex items-center gap-2 text-sm font-semibold text-slate-200 transition group-hover:text-cyan-100">
                                                Meet member
                                                <ArrowUpRight className="h-4 w-4 transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                                            </span>
                                        )}
                                    </div>
                                </Reveal>
                            ))
                            : null}
                    </div>
                </section>

                <section id="gallery" className="mx-auto max-w-[84rem] border-t border-white/5 px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-24 2xl:max-w-[90rem]">
                    <Reveal>
                        <SectionHeading
                            eyebrow="Gallery"
                            title="Highlights that make the culture feel visible."
                            description="Even with placeholder content, the structure is ready for event photos, build-week moments, and project snapshots without breaking the layout."
                        />
                    </Reveal>

                    <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                        {galleryHighlights.map((item, index) => (
                            <Reveal
                                key={item.title}
                                delay={index * 0.05}
                                className="group overflow-hidden rounded-[1.9rem] border border-white/10 bg-white/5"
                            >
                                <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-ink-800 via-ink-900 to-black p-5">
                                    <img
                                        src={item.image}
                                        alt={item.title}
                                        className="absolute inset-0 h-full w-full object-cover object-center opacity-45 transition duration-700 group-hover:scale-110"
                                        loading="lazy"
                                        sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 25vw"
                                    />
                                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.3),_transparent_40%),linear-gradient(to_top,_rgba(3,7,18,0.82),_rgba(3,7,18,0.25))]" />
                                    <div className="relative flex h-full flex-col justify-between">
                                        <span className="inline-flex w-fit rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-slate-300">
                                            {item.metric}
                                        </span>
                                        <div>
                                            <h3 className="font-display text-2xl font-semibold text-white">{item.title}</h3>
                                            <p className="mt-3 text-sm leading-6 text-slate-300">{item.caption}</p>
                                        </div>
                                    </div>
                                </div>
                            </Reveal>
                        ))}
                    </div>
                </section>

                <section className="mx-auto max-w-[84rem] border-t border-white/5 px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-24 2xl:max-w-[90rem]">
                    <Reveal>
                        <SectionHeading
                            eyebrow="Testimonials"
                            title="Student voices that make the club feel real."
                            description="Member stories should read like authentic outcomes, not marketing copy. This section keeps that tone simple and credible."
                        />
                    </Reveal>

                    <div className="mt-10 grid gap-5 lg:grid-cols-3">
                        {testimonials.map((item, index) => (
                            <Reveal key={item.name} delay={index * 0.05} className={sectionCardClass}>
                                <p className="font-display text-5xl leading-none text-cyan-300/70">“</p>
                                <p className="mt-3 text-sm leading-7 text-slate-300">{item.quote}</p>
                                <div className="mt-6 border-t border-white/10 pt-4">
                                    <p className="font-display text-lg font-semibold text-white">{item.name}</p>
                                    <p className="text-sm text-slate-400">{item.detail}</p>
                                </div>
                            </Reveal>
                        ))}
                    </div>
                </section>

                <section id="join" className="mx-auto max-w-[84rem] border-t border-white/5 px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-24 2xl:max-w-[90rem]">
                    <Reveal>
                        <div className="relative overflow-hidden rounded-[2rem] border border-cyan-400/20 bg-gradient-to-br from-cyan-400/15 via-white/5 to-white/5 p-6 sm:p-8 lg:p-10">
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(34,211,238,0.22),_transparent_30%),radial-gradient(circle_at_bottom_left,_rgba(14,165,233,0.18),_transparent_28%)]" />
                            <div className="relative grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
                                <div>
                                    <p className="text-sm uppercase tracking-[0.22em] text-cyan-100/80">Join the club</p>
                                    <h2 className="mt-4 font-display text-[clamp(1.8rem,5vw,3rem)] font-semibold tracking-tight text-white">
                                        Build with people who care about quality.
                                    </h2>
                                    <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-200 sm:text-base">
                                        Whether you are a frontend developer, backend builder, designer, writer, or organizer, there is room to contribute. The site is ready for future forms and backend hooks, but the message today is simple: show up and build.
                                    </p>

                                    <div className="mt-6 space-y-3">
                                        {joinReasons.map((reason) => (
                                            <div key={reason} className="flex items-start gap-3 text-sm text-slate-200">
                                                <span className="mt-2 h-2 w-2 rounded-full bg-cyan-200" />
                                                <span>{reason}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                                        <a
                                            href="mailto:devcell@iitmandi.ac.in"
                                            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-ink-950 transition hover:-translate-y-0.5 hover:bg-cyan-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-900 sm:w-auto"
                                        >
                                            Contact the club
                                            <ArrowRight className="h-4 w-4" />
                                        </a>
                                        <a
                                            href="#top"
                                            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-900 sm:w-auto"
                                        >
                                            Back to top
                                        </a>
                                    </div>
                                </div>

                                <div className="grid gap-4">
                                    <form onSubmit={handleJoinSubmit} className="rounded-3xl border border-white/10 bg-black/20 p-5">
                                        <p className="font-display text-lg font-semibold text-white">Join Application</p>
                                        <p className="mt-2 text-sm text-slate-300">Submit this form to apply for Dev Cell.</p>

                                        <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                            <input
                                                type="text"
                                                placeholder="Name"
                                                value={joinForm.name || ""}
                                                onChange={(event) => handleJoinChange("name", event.target.value)}
                                                className="min-h-11 rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white placeholder:text-slate-400 focus:border-cyan-300/40 focus:outline-none"
                                                required
                                            />
                                            <input
                                                type="email"
                                                placeholder="Email"
                                                value={joinForm.email || ""}
                                                onChange={(event) => handleJoinChange("email", event.target.value)}
                                                className="min-h-11 rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white placeholder:text-slate-400 focus:border-cyan-300/40 focus:outline-none"
                                                required
                                            />
                                            <input
                                                type="text"
                                                placeholder="Year"
                                                value={joinForm.year || ""}
                                                onChange={(event) => handleJoinChange("year", event.target.value)}
                                                className="min-h-11 rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white placeholder:text-slate-400 focus:border-cyan-300/40 focus:outline-none"
                                            />
                                            <input
                                                type="text"
                                                placeholder="Interest"
                                                value={joinForm.interest || ""}
                                                onChange={(event) => handleJoinChange("interest", event.target.value)}
                                                className="min-h-11 rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white placeholder:text-slate-400 focus:border-cyan-300/40 focus:outline-none"
                                            />
                                        </div>

                                        <textarea
                                            placeholder="Message"
                                            value={joinForm.message || ""}
                                            onChange={(event) => handleJoinChange("message", event.target.value)}
                                            className="mt-3 min-h-28 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-white placeholder:text-slate-400 focus:border-cyan-300/40 focus:outline-none"
                                        />

                                        <button
                                            type="submit"
                                            disabled={joinSubmitting}
                                            className="mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-cyan-400 px-4 py-2 text-sm font-semibold text-ink-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-70"
                                        >
                                            {joinSubmitting ? "Submitting..." : "Submit application"}
                                        </button>

                                        {joinMessage ? (
                                            <p className={`mt-3 text-sm ${joinMessage.type === "success" ? "text-emerald-300" : "text-rose-300"}`}>
                                                {joinMessage.text}
                                            </p>
                                        ) : null}
                                    </form>

                                    <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
                                        <p className="font-display text-lg font-semibold text-white">MVP Flow Ready</p>
                                        <p className="mt-3 text-sm leading-6 text-slate-300">
                                            Team, events, and resources now load from live backend APIs and this form stores join submissions in MySQL.
                                        </p>
                                    </div>
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