import { useEffect, useMemo, useState } from "react";

import { ElectricCard } from "@/components/ElectricCard";
import { GridMotion } from "@/components/GridMotion";
import { ScrollStack } from "@/components/ScrollStack";
import { Stack } from "@/components/Stack";
import { API_BASE_URL } from "@/lib/api";
import { Activity, ArrowRight, BarChart3, ClipboardList, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";

const stats = [
    { label: "Open submissions", value: "24" },
    { label: "Published projects", value: "17" },
    { label: "Pending events", value: "5" },
    { label: "Team updates", value: "11" },
];

export function AdminDashboardPage() {
    const navigate = useNavigate();
    const [authorized, setAuthorized] = useState(false);

    useEffect(() => {
        let mounted = true;
        const token = localStorage.getItem("devcell_id_token");
        if (!token) {
            navigate("/admin/login", { replace: true });
            return;
        }

        const validate = async () => {
            const response = await fetch(`${API_BASE_URL}/me`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!mounted) {
                return;
            }

            if (!response.ok) {
                localStorage.removeItem("devcell_id_token");
                navigate("/admin/login", { replace: true });
                return;
            }

            setAuthorized(true);
        };

        validate().catch(() => {
            if (!mounted) {
                return;
            }
            localStorage.removeItem("devcell_id_token");
            navigate("/admin/login", { replace: true });
        });

        return () => {
            mounted = false;
        };
    }, [navigate]);

    if (!authorized) {
        return <div className="min-h-screen bg-ink-950" />;
    }

    const workflowItems = useMemo(
        () => [
            {
                id: "w1",
                content: (
                    <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-cyan-100/75">Moderation</p>
                        <h3 className="mt-2 font-display text-xl font-semibold text-white">Review join applications</h3>
                        <p className="mt-2 text-sm leading-7 text-slate-300">Validate student details and keep status feedback quick.</p>
                    </div>
                ),
            },
            {
                id: "w2",
                content: (
                    <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-cyan-100/75">Content ops</p>
                        <h3 className="mt-2 font-display text-xl font-semibold text-white">Update public showcase cards</h3>
                        <p className="mt-2 text-sm leading-7 text-slate-300">Refresh projects and former leads with consistent metadata.</p>
                    </div>
                ),
            },
            {
                id: "w3",
                content: (
                    <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-cyan-100/75">Event pipeline</p>
                        <h3 className="mt-2 font-display text-xl font-semibold text-white">Publish event timeline</h3>
                        <p className="mt-2 text-sm leading-7 text-slate-300">Keep posters, registrations, and venues synchronized.</p>
                    </div>
                ),
            },
        ],
        [],
    );

    return (
        <div className="relative min-h-screen bg-ink-950 text-white">
            <header className="relative overflow-hidden border-b border-white/10 px-4 py-12 sm:px-6 lg:px-8">
                <GridMotion className="-z-10" />
                <div className="mx-auto max-w-7xl">
                    <p className="text-xs uppercase tracking-[0.22em] text-cyan-100/80">Admin dashboard</p>
                    <h1 className="mt-3 font-display text-4xl font-semibold text-white">Operations overview</h1>
                    <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
                        Manage public content, approvals, and workflow health from one place.
                    </p>
                </div>
            </header>

            <main className="mx-auto max-w-7xl space-y-12 px-4 py-10 sm:px-6 lg:px-8">
                <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {stats.map((stat) => (
                        <ElectricCard key={stat.label} intensity="soft" className="p-5">
                            <p className="text-xs uppercase tracking-[0.18em] text-cyan-100/70">{stat.label}</p>
                            <p className="mt-3 font-display text-3xl font-semibold text-white">{stat.value}</p>
                        </ElectricCard>
                    ))}
                </section>

                <section className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
                    <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-cyan-100/75">Activity workflow</p>
                        <h2 className="mt-3 font-display text-2xl font-semibold text-white">Stacked admin actions</h2>
                        <div className="mt-6">
                            <ScrollStack items={workflowItems} />
                        </div>
                    </div>

                    <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-cyan-100/75">Module previews</p>
                        <h2 className="mt-3 font-display text-2xl font-semibold text-white">Quick modules</h2>
                        <Stack
                            className="mt-6"
                            items={[
                                {
                                    id: "m1",
                                    content: (
                                        <div>
                                            <ClipboardList className="h-5 w-5 text-cyan-300" />
                                            <p className="mt-3 text-sm font-semibold text-white">Applications queue</p>
                                        </div>
                                    ),
                                },
                                {
                                    id: "m2",
                                    content: (
                                        <div>
                                            <BarChart3 className="h-5 w-5 text-cyan-300" />
                                            <p className="mt-3 text-sm font-semibold text-white">Engagement metrics</p>
                                        </div>
                                    ),
                                },
                                {
                                    id: "m3",
                                    content: (
                                        <div>
                                            <Activity className="h-5 w-5 text-cyan-300" />
                                            <p className="mt-3 text-sm font-semibold text-white">Event pulse</p>
                                        </div>
                                    ),
                                },
                            ]}
                        />
                    </div>
                </section>

                <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                            <p className="text-xs uppercase tracking-[0.2em] text-cyan-100/75">Security</p>
                            <h3 className="mt-2 font-display text-2xl font-semibold text-white">Permission-aware access</h3>
                        </div>
                        <ShieldCheck className="h-7 w-7 text-cyan-300" />
                    </div>
                    <p className="mt-3 text-sm leading-7 text-slate-300">Use role checks from backend before exposing write actions in production.</p>
                    <button className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl border border-cyan-300/35 bg-cyan-400/10 px-4 py-2 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-400/15">
                        Open admin APIs
                        <ArrowRight className="h-4 w-4" />
                    </button>
                </section>
            </main>
        </div>
    );
}
