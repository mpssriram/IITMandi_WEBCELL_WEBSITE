import { useEffect, useMemo, useRef, useState } from "react";

import { Bell, BookOpen, CalendarDays, ChevronDown, ChevronRight, FolderKanban, LogOut, UserCircle } from "lucide-react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";

import { ElectricCard } from "@/components/ElectricCard";
import { UserAvatar } from "@/components/UserAvatar";
import {
    API_BASE_URL,
    getPublicEvents,
    getPublicResources,
    getUserProfile,
    type PublicEvent,
    type PublicResource,
    type UserProfile,
} from "@/lib/api";
import { dedupeEvents, dedupeResources } from "@/lib/collections";
import { auth } from "@/lib/firebase";

export type UserNotification = {
    id: string;
    title: string;
    description: string;
    href: string;
};

export type UserAreaContext = {
    token: string;
    profile: UserProfile | null;
    previewEvents: PublicEvent[];
    previewResources: PublicResource[];
    notifications: UserNotification[];
    unreadCount: number;
    refreshProfile: () => Promise<void>;
    openProfile: () => void;
    openNotifications: () => void;
    logout: () => Promise<void>;
};

const navItems = [
    { to: "/user/dashboard", label: "Dashboard" },
    { to: "/user/events", label: "Events" },
    { to: "/user/resources", label: "Resources" },
];

function isUpcoming(dateValue?: string | null) {
    if (!dateValue) {
        return false;
    }

    const parsed = new Date(`${dateValue}T00:00:00`);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return !Number.isNaN(parsed.getTime()) && parsed >= today;
}

function formatEventDate(dateValue?: string | null) {
    if (!dateValue) {
        return "Date TBA";
    }

    const parsed = new Date(`${dateValue}T00:00:00`);
    if (Number.isNaN(parsed.getTime())) {
        return dateValue;
    }

    return parsed.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
    });
}

export function UserAreaLayout() {
    const navigate = useNavigate();
    const location = useLocation();
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState("");
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [previewEvents, setPreviewEvents] = useState<PublicEvent[]>([]);
    const [previewResources, setPreviewResources] = useState<PublicResource[]>([]);
    const [isNotificationsPanelOpen, setIsNotificationsPanelOpen] = useState(false);
    const [isQuickMenuOpen, setIsQuickMenuOpen] = useState(false);
    const notificationsPanelRef = useRef<HTMLDivElement | null>(null);
    const notificationButtonRef = useRef<HTMLButtonElement | null>(null);
    const quickMenuRef = useRef<HTMLDivElement | null>(null);
    const quickMenuButtonRef = useRef<HTMLButtonElement | null>(null);

    const refreshProfile = async () => {
        const nextToken = localStorage.getItem("devcell_id_token");
        if (!nextToken) {
            return;
        }
        const nextProfile = await getUserProfile(nextToken);
        setProfile(nextProfile);
    };

    useEffect(() => {
        let mounted = true;

        const bootstrap = async () => {
            const storedToken = localStorage.getItem("devcell_id_token");
            if (!storedToken) {
                navigate("/login", { replace: true });
                return;
            }

            const response = await fetch(`${API_BASE_URL}/me`, {
                headers: {
                    Authorization: `Bearer ${storedToken}`,
                },
            });

            if (!response.ok) {
                localStorage.removeItem("devcell_id_token");
                navigate("/login", { replace: true });
                return;
            }

            const payload = (await response.json()) as {
                user?: UserProfile & {
                    admin?: boolean;
                };
            };

            const sessionUser = payload?.user || null;

            const [userProfileResult, eventsResult, resourcesResult] = await Promise.allSettled([
                getUserProfile(storedToken),
                getPublicEvents(6, 0),
                getPublicResources(6, 0),
            ]);

            if (!mounted) {
                return;
            }

            setToken(storedToken);
            setProfile(userProfileResult.status === "fulfilled" ? userProfileResult.value : sessionUser);
            setPreviewEvents(eventsResult.status === "fulfilled" ? dedupeEvents(eventsResult.value.items || []) : []);
            setPreviewResources(resourcesResult.status === "fulfilled" ? dedupeResources(resourcesResult.value.items || []) : []);
            setLoading(false);
        };

        bootstrap().catch(() => {
            if (!mounted) {
                return;
            }
            localStorage.removeItem("devcell_id_token");
            navigate("/login", { replace: true });
        });

        return () => {
            mounted = false;
        };
    }, [navigate]);

    const notifications = useMemo<UserNotification[]>(() => {
        const items: UserNotification[] = [];

        const nextUpcoming = previewEvents.find((eventItem) => isUpcoming(eventItem.date));
        if (nextUpcoming) {
            const description = nextUpcoming.venue
                ? `${formatEventDate(nextUpcoming.date)} | ${nextUpcoming.venue}`
                : formatEventDate(nextUpcoming.date);

            items.push({
                id: `event-${nextUpcoming.id}`,
                title: `Upcoming: ${nextUpcoming.title}`,
                description,
                href: "/user/events",
            });
        }

        const announcementResource =
            previewResources.find((resource) => (resource.category || "").toLowerCase().includes("announcement")) ||
            previewResources[0];

        if (announcementResource) {
            items.push({
                id: `resource-${announcementResource.id}`,
                title: announcementResource.title,
                description: announcementResource.description || announcementResource.category || "New resource available",
                href: "/user/resources",
            });
        }

        if (profile && !profile.roll_number) {
            items.push({
                id: "profile-roll-number",
                title: "Complete your profile",
                description: "Add your roll number so event registrations and admin workflows stay in sync.",
                href: "/user/profile",
            });
        }

        return items;
    }, [previewEvents, previewResources, profile]);

    const unreadCount = notifications.length;

    useEffect(() => {
        const state = location.state as { openNotifications?: boolean } | null;
        if (!state?.openNotifications) {
            return;
        }

        setIsNotificationsPanelOpen(true);
        navigate(location.pathname, { replace: true, state: null });
    }, [location.pathname, location.state, navigate]);

    useEffect(() => {
        if (!isNotificationsPanelOpen) {
            return;
        }

        const handlePointerDown = (event: MouseEvent) => {
            const targetNode = event.target as Node;
            const insidePanel = notificationsPanelRef.current?.contains(targetNode);
            const insideButton = notificationButtonRef.current?.contains(targetNode);

            if (insidePanel || insideButton) {
                return;
            }

            setIsNotificationsPanelOpen(false);
        };

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setIsNotificationsPanelOpen(false);
            }
        };

        document.addEventListener("mousedown", handlePointerDown);
        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("mousedown", handlePointerDown);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [isNotificationsPanelOpen]);

    useEffect(() => {
        if (!isQuickMenuOpen) {
            return;
        }

        const handlePointerDown = (event: MouseEvent) => {
            const targetNode = event.target as Node;
            const insidePanel = quickMenuRef.current?.contains(targetNode);
            const insideButton = quickMenuButtonRef.current?.contains(targetNode);

            if (insidePanel || insideButton) {
                return;
            }

            setIsQuickMenuOpen(false);
        };

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setIsQuickMenuOpen(false);
            }
        };

        document.addEventListener("mousedown", handlePointerDown);
        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("mousedown", handlePointerDown);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [isQuickMenuOpen]);

    const openNotifications = () => {
        setIsQuickMenuOpen(false);
        setIsNotificationsPanelOpen(true);
    };

    const closeNotifications = () => {
        setIsNotificationsPanelOpen(false);
    };

    const openProfile = () => {
        setIsQuickMenuOpen(false);
        closeNotifications();
        navigate("/user/profile", {
            state: {
                backgroundLocation: location,
            },
        });
    };

    const openNotificationTarget = (href: string) => {
        closeNotifications();
        setIsQuickMenuOpen(false);
        if (href === "/user/profile") {
            openProfile();
            return;
        }
        navigate(href);
    };

    const logout = async () => {
        setIsQuickMenuOpen(false);
        try {
            await signOut(auth);
        } catch {
            // Ignore Firebase sign-out failures and still clear local session.
        } finally {
            localStorage.removeItem("devcell_id_token");
            navigate("/login", { replace: true });
        }
    };

    const outletContext: UserAreaContext = {
        token,
        profile,
        previewEvents,
        previewResources,
        notifications,
        unreadCount,
        refreshProfile,
        openProfile,
        openNotifications,
        logout,
    };

    if (loading) {
        return (
            <div className="grid min-h-screen place-items-center bg-ink-950 px-4 text-center text-slate-300">
                <p className="text-sm">Loading your workspace...</p>
            </div>
        );
    }

    return (
        <div className="relative min-h-screen bg-ink-950 text-white">
            <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.16),transparent_30%),radial-gradient(circle_at_top_right,rgba(59,130,246,0.14),transparent_28%),linear-gradient(180deg,#050816_0%,#071121_48%,#050816_100%)]" />
            <div className="pointer-events-none absolute inset-0 -z-10 bg-club-grid bg-[size:52px_52px] opacity-[0.08]" />

            <header className="sticky top-0 z-40 border-b border-white/10 bg-ink-950/85 backdrop-blur-xl">
                <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="min-w-0">
                            <p className="text-[11px] uppercase tracking-[0.24em] text-cyan-100/70">IIT Mandi Dev Cell</p>
                            <div className="mt-1 flex min-w-0 items-center gap-3">
                                <span className="rounded-full border border-cyan-300/20 bg-cyan-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-100/85">
                                    User workspace
                                </span>
                                <p className="truncate text-sm text-slate-300">
                                    {profile?.name || "Dev Cell Member"}
                                    {profile?.email ? ` | ${profile.email}` : ""}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 sm:gap-3">
                            <button
                                ref={notificationButtonRef}
                                type="button"
                                onClick={() => setIsNotificationsPanelOpen((current) => !current)}
                                className={`relative inline-flex h-11 w-11 items-center justify-center rounded-2xl border bg-white/5 text-slate-200 transition hover:border-cyan-300/35 hover:bg-cyan-400/10 ${
                                    isNotificationsPanelOpen ? "border-cyan-300/40" : "border-white/10"
                                }`}
                                aria-label="Notifications"
                                aria-expanded={isNotificationsPanelOpen}
                            >
                                <Bell className="h-5 w-5" />
                                {unreadCount ? (
                                    <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-cyan-300 shadow-[0_0_14px_rgba(103,232,249,0.9)]" />
                                ) : null}
                            </button>

                            <button
                                type="button"
                                onClick={openProfile}
                                className="inline-flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-2.5 py-1.5 text-left transition hover:border-cyan-300/35 hover:bg-cyan-400/10"
                            >
                                <UserAvatar name={profile?.name} email={profile?.email} />
                                <div className="hidden min-w-0 sm:block">
                                    <p className="truncate text-sm font-semibold text-white">{profile?.name || "Profile"}</p>
                                    <p className="truncate text-xs text-slate-400">{profile?.roll_number || profile?.email || "Open profile"}</p>
                                </div>
                            </button>

                            <div className="relative">
                                <button
                                    ref={quickMenuButtonRef}
                                    type="button"
                                    onClick={() => setIsQuickMenuOpen((current) => !current)}
                                    className={`inline-flex h-11 items-center gap-2 rounded-2xl border bg-white/5 px-3 text-sm font-semibold text-slate-200 transition hover:border-cyan-300/35 hover:bg-cyan-400/10 ${
                                        isQuickMenuOpen ? "border-cyan-300/40" : "border-white/10"
                                    }`}
                                    aria-label="Quick menu"
                                    aria-expanded={isQuickMenuOpen}
                                >
                                    Menu
                                    <ChevronDown className="h-4 w-4" />
                                </button>

                                <div
                                    ref={quickMenuRef}
                                    className={`absolute right-0 top-[3.2rem] z-50 w-60 rounded-2xl border border-cyan-300/20 bg-[linear-gradient(145deg,rgba(6,17,35,0.98),rgba(4,10,23,0.96))] p-2 shadow-[0_22px_70px_-28px_rgba(8,145,178,0.8)] transition-all ${
                                        isQuickMenuOpen ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-1 opacity-0"
                                    }`}
                                    role="menu"
                                    aria-hidden={!isQuickMenuOpen}
                                >
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsQuickMenuOpen(false);
                                            navigate("/user/events");
                                        }}
                                        className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm text-slate-200 transition hover:bg-white/10 hover:text-white"
                                    >
                                        <CalendarDays className="h-4 w-4 text-cyan-200" />
                                        Events
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsQuickMenuOpen(false);
                                            navigate("/user/resources");
                                        }}
                                        className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm text-slate-200 transition hover:bg-white/10 hover:text-white"
                                    >
                                        <BookOpen className="h-4 w-4 text-cyan-200" />
                                        Resources
                                    </button>
                                    <a
                                        href="/#projects"
                                        onClick={() => setIsQuickMenuOpen(false)}
                                        className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-slate-200 transition hover:bg-white/10 hover:text-white"
                                    >
                                        <FolderKanban className="h-4 w-4 text-cyan-200" />
                                        Projects
                                    </a>
                                    <button
                                        type="button"
                                        onClick={openProfile}
                                        className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm text-slate-200 transition hover:bg-white/10 hover:text-white"
                                    >
                                        <UserCircle className="h-4 w-4 text-cyan-200" />
                                        Profile
                                    </button>
                                    <button
                                        type="button"
                                        onClick={openNotifications}
                                        className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm text-slate-200 transition hover:bg-white/10 hover:text-white"
                                    >
                                        <Bell className="h-4 w-4 text-cyan-200" />
                                        Notifications
                                    </button>
                                    <button
                                        type="button"
                                        onClick={logout}
                                        className="mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm text-rose-100 transition hover:bg-rose-400/20"
                                    >
                                        <LogOut className="h-4 w-4" />
                                        Logout
                                    </button>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={logout}
                                className="inline-flex h-11 items-center gap-2 rounded-2xl border border-rose-300/20 bg-rose-400/10 px-4 text-sm font-semibold text-rose-100 transition hover:border-rose-200/40 hover:bg-rose-400/15"
                            >
                                <LogOut className="h-4 w-4" />
                                <span className="hidden sm:inline">Logout</span>
                            </button>
                        </div>
                    </div>

                    <nav className="flex flex-wrap gap-2">
                        {navItems.map((item) => (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                className={({ isActive }) =>
                                    `inline-flex min-h-10 items-center rounded-full border px-4 py-2 text-sm font-medium transition ${
                                        isActive
                                            ? "border-cyan-300/35 bg-cyan-400/14 text-cyan-50"
                                            : "border-white/10 bg-white/5 text-slate-300 hover:border-cyan-300/25 hover:bg-cyan-400/10 hover:text-white"
                                    }`
                                }
                            >
                                {item.label}
                            </NavLink>
                        ))}
                        <button
                            type="button"
                            onClick={openProfile}
                            className="inline-flex min-h-10 items-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-300 transition hover:border-cyan-300/25 hover:bg-cyan-400/10 hover:text-white"
                        >
                            Profile
                        </button>
                    </nav>
                </div>
            </header>

            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <Outlet context={outletContext} />
            </main>
            {isNotificationsPanelOpen ? <div className="fixed inset-0 z-40 bg-transparent" aria-hidden="true" /> : null}

            <div className="pointer-events-none fixed inset-x-0 top-20 z-50 mx-auto flex w-full max-w-7xl justify-end px-4 sm:px-6 lg:px-8">
                <div
                    ref={notificationsPanelRef}
                    className={`pointer-events-auto w-full max-w-sm rounded-[1.5rem] border border-cyan-300/25 bg-[linear-gradient(145deg,rgba(6,17,35,0.98),rgba(4,10,23,0.96))] p-4 shadow-[0_28px_90px_-32px_rgba(8,145,178,0.7)] backdrop-blur-xl transition-all duration-200 ${
                        isNotificationsPanelOpen ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-3 opacity-0"
                    }`}
                    role="dialog"
                    aria-label="Notifications panel"
                    aria-hidden={!isNotificationsPanelOpen}
                >
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <p className="text-[11px] uppercase tracking-[0.22em] text-cyan-100/70">Notifications</p>
                            <p className="mt-1 text-sm font-semibold text-white">{unreadCount ? `${unreadCount} unread` : "All caught up"}</p>
                        </div>
                        <button
                            type="button"
                            onClick={closeNotifications}
                            className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-200 transition hover:border-cyan-300/35 hover:bg-cyan-400/10"
                        >
                            Close
                        </button>
                    </div>

                    <div className="mt-4 max-h-[24rem] space-y-2.5 overflow-y-auto pr-1">
                        {notifications.map((item) => (
                            <button
                                key={item.id}
                                type="button"
                                onClick={() => openNotificationTarget(item.href)}
                                className="group w-full rounded-2xl border border-white/10 bg-white/[0.045] p-3 text-left transition hover:-translate-y-0.5 hover:border-cyan-300/30 hover:bg-cyan-400/10"
                            >
                                <div className="flex items-start justify-between gap-2">
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-semibold text-white">{item.title}</p>
                                        <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-300">{item.description}</p>
                                    </div>
                                    <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-cyan-300 shadow-[0_0_14px_rgba(103,232,249,0.9)]" />
                                </div>
                                <div className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-cyan-100/80 transition group-hover:text-cyan-50">
                                    Open
                                    <ChevronRight className="h-3.5 w-3.5" />
                                </div>
                            </button>
                        ))}

                        {!notifications.length ? (
                            <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.03] p-4 text-center">
                                <p className="text-sm font-semibold text-white">Nothing new right now</p>
                                <p className="mt-1 text-xs leading-5 text-slate-300">Event reminders and resource updates will appear here.</p>
                            </div>
                        ) : null}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default UserAreaLayout;
