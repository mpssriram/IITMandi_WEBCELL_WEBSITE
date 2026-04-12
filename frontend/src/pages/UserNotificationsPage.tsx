import { useEffect, useState } from "react";

import { Bell, ArrowRight, Sparkles } from "lucide-react";
import { Link, useOutletContext } from "react-router-dom";

import { ElectricCard } from "@/components/ElectricCard";
import { API_BASE_URL } from "@/lib/api";
import type { UserAreaContext } from "@/layouts/UserAreaLayout";

type NotificationItem = {
    id: string;
    title: string;
    description: string;
    href?: string;
};

function isValidNotificationItem(value: unknown): value is NotificationItem {
    if (!value || typeof value !== "object") {
        return false;
    }

    const record = value as Record<string, unknown>;
    return typeof record.id === "string" && typeof record.title === "string" && typeof record.description === "string";
}

export function UserNotificationsPage() {
    const { profile, unreadCount } = useOutletContext<UserAreaContext>();
    const [loading, setLoading] = useState(true);
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);

    useEffect(() => {
        let active = true;

        const loadNotifications = async () => {
            // TODO: replace this probe with a dedicated notifications endpoint contract when the backend adds one.
            try {
                const token = localStorage.getItem("devcell_id_token");
                const response = await fetch(`${API_BASE_URL}/user/notifications`, {
                    headers: {
                        "Content-Type": "application/json",
                        ...(token ? { Authorization: `Bearer ${token}` } : {}),
                    },
                });

                if (!active) {
                    return;
                }

                if (!response.ok) {
                    setNotifications([]);
                    return;
                }

                const payload = (await response.json()) as { items?: unknown; notifications?: unknown };
                const rawItems = Array.isArray(payload?.items)
                    ? payload.items
                    : Array.isArray(payload?.notifications)
                        ? payload.notifications
                        : [];

                setNotifications(rawItems.filter(isValidNotificationItem));
            } catch {
                if (active) {
                    setNotifications([]);
                }
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        };

        void loadNotifications();

        return () => {
            active = false;
        };
    }, []);

    return (
        <div className="space-y-6">
            <section className="grid gap-4 lg:grid-cols-[1.08fr_0.92fr]">
                <ElectricCard intensity="soft" className="p-6 sm:p-7">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <p className="text-xs uppercase tracking-[0.22em] text-cyan-100/75">Notifications</p>
                            <h1 className="mt-3 font-display text-3xl font-semibold text-white">Workspace notifications</h1>
                            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
                                This page will show backend notifications once the dedicated endpoint is available. For now, it safely stays empty instead of redirecting.
                            </p>
                        </div>

                        <div className="rounded-2xl border border-cyan-300/20 bg-cyan-400/10 p-3 text-cyan-100">
                            <Bell className="h-5 w-5" />
                        </div>
                    </div>
                </ElectricCard>

                <ElectricCard intensity="soft" className="p-6 sm:p-7">
                    <p className="text-xs uppercase tracking-[0.22em] text-cyan-100/75">Status</p>
                    <div className="mt-4 space-y-3 text-sm text-slate-300">
                        <p>{profile?.name || "Member"}</p>
                        <p>{unreadCount ? `${unreadCount} unread workspace items` : "No unread workspace items"}</p>
                        <p>Endpoint probe: /user/notifications</p>
                    </div>
                </ElectricCard>
            </section>

            {loading ? (
                <section className="grid gap-4 lg:grid-cols-2">
                    {Array.from({ length: 2 }).map((_, index) => (
                        <ElectricCard key={index} intensity="soft" className="p-5">
                            <div className="h-5 w-40 animate-pulse rounded bg-white/10" />
                            <div className="mt-4 h-16 animate-pulse rounded bg-white/10" />
                        </ElectricCard>
                    ))}
                </section>
            ) : notifications.length ? (
                <section className="grid gap-4 lg:grid-cols-2">
                    {notifications.map((notification) => {
                        const content = (
                            <ElectricCard key={notification.id} intensity="soft" className="p-5">
                                <div className="flex items-start gap-3">
                                    <div className="mt-0.5 rounded-2xl border border-cyan-300/20 bg-cyan-400/10 p-2 text-cyan-200">
                                        <Sparkles className="h-4 w-4" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h2 className="font-semibold text-white">{notification.title}</h2>
                                        <p className="mt-2 text-sm leading-7 text-slate-300">{notification.description}</p>
                                    </div>
                                </div>
                            </ElectricCard>
                        );

                        if (!notification.href) {
                            return content;
                        }

                        if (/^https?:\/\//i.test(notification.href)) {
                            return (
                                <a key={notification.id} href={notification.href} target="_blank" rel="noreferrer" className="block">
                                    {content}
                                </a>
                            );
                        }

                        return (
                            <Link key={notification.id} to={notification.href} className="block">
                                {content}
                            </Link>
                        );
                    })}
                </section>
            ) : (
                <ElectricCard intensity="soft" className="flex min-h-[16rem] flex-col items-center justify-center px-6 py-10 text-center">
                    <div className="rounded-full border border-cyan-300/20 bg-cyan-400/10 p-4 text-cyan-100">
                        <Bell className="h-6 w-6" />
                    </div>
                    <h2 className="mt-5 font-display text-2xl font-semibold text-white">No notifications yet</h2>
                    <p className="mt-3 max-w-xl text-sm leading-7 text-slate-300">
                        No backend notifications were returned, so this page stays quiet instead of showing a broken redirect or empty shell.
                    </p>
                    <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">
                        TODO: connect the notifications endpoint
                        <ArrowRight className="h-4 w-4" />
                    </div>
                </ElectricCard>
            )}
        </div>
    );
}

