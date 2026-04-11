import { Bell, Inbox } from "lucide-react";
import { Link, useOutletContext } from "react-router-dom";

import { ElectricCard } from "@/components/ElectricCard";
import type { UserAreaContext } from "@/layouts/UserAreaLayout";

export function UserNotificationsPage() {
    const { notifications, unreadCount } = useOutletContext<UserAreaContext>();

    return (
        <div className="space-y-8">
            <section className="rounded-[2rem] border border-white/10 bg-[linear-gradient(135deg,rgba(8,19,40,0.96),rgba(6,14,27,0.9))] p-6 sm:p-8">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <p className="text-xs uppercase tracking-[0.24em] text-cyan-100/75">Notifications</p>
                        <h1 className="mt-3 font-display text-3xl font-semibold text-white sm:text-4xl">Workspace updates</h1>
                        <p className="mt-3 text-sm leading-7 text-slate-300">
                            Keep an eye on reminders, fresh resources, and profile actions without crowding the dashboard.
                        </p>
                    </div>
                    <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-400/10 px-4 py-2 text-sm font-semibold text-cyan-100">
                        <Bell className="h-4 w-4" />
                        {unreadCount} unread
                    </div>
                </div>
            </section>

            {notifications.length ? (
                <section className="grid gap-4">
                    {notifications.map((item) => (
                        <ElectricCard key={item.id} className="p-5">
                            <p className="font-semibold text-white">{item.title}</p>
                            <p className="mt-2 text-sm leading-7 text-slate-300">{item.description}</p>
                            <Link to={item.href} className="mt-4 inline-flex text-sm font-semibold text-cyan-100 hover:text-cyan-50">
                                Open
                            </Link>
                        </ElectricCard>
                    ))}
                </section>
            ) : (
                <ElectricCard intensity="soft" className="p-8">
                    <div className="flex flex-col items-center justify-center text-center">
                        <div className="rounded-3xl border border-white/10 bg-white/5 p-4 text-cyan-200">
                            <Inbox className="h-6 w-6" />
                        </div>
                        <p className="mt-4 font-display text-2xl font-semibold text-white">No notifications yet</p>
                        <p className="mt-3 max-w-md text-sm leading-7 text-slate-300">
                            When new event reminders, announcements, or profile prompts arrive, they will appear here with a clean empty state until then.
                        </p>
                    </div>
                </ElectricCard>
            )}
        </div>
    );
}

export default UserNotificationsPage;
