import { useEffect, useMemo, useState, memo } from "react";
import { Link } from "react-router-dom";
import { 
    Activity, 
    BarChart3, 
    ClipboardList, 
    ArrowRight, 
    UsersRound, 
    Calendar,
    FolderKanban,
    Library,
    Plus,
    CheckCircle2
} from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { getAdminDashboard, type AdminDashboardData } from "@/lib/api";
import { ElectricCard } from "@/components/ElectricCard";

const emptyDashboard: AdminDashboardData = {
    counts: {
        total_events: 0,
        upcoming_events: 0,
        past_events: 0,
        total_resources: 0,
        total_team_members: 0,
        total_public_team_members: 0,
        total_projects: 0,
        total_join_applications: 0,
        total_registrations: 0,
        full_events: 0,
        events_with_no_registrations: 0,
    },
    recent_events: [],
    recent_resources: [],
    recent_projects: [],
    recent_team_members: [],
    recent_join_applications: [],
};

// ─── Sub-components ─────────────────────────────────────────────────────────

const OverviewStat = memo(({ label, value, icon: Icon, trend }: { label: string; value: string | number; icon: any; trend?: string }) => {
    return (
        <ElectricCard intensity="soft" className="relative overflow-hidden p-5">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-500">{label}</p>
                    <h3 className="mt-2 text-3xl font-bold tracking-tight text-white">{value}</h3>
                    {trend && (
                        <p className="mt-2 text-[11px] font-medium text-emerald-400">
                            {trend} <span className="text-slate-500 ml-1">vs last month</span>
                        </p>
                    )}
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.03] border border-white/[0.06] text-slate-400">
                    <Icon className="h-5 w-5" />
                </div>
            </div>
        </ElectricCard>
    );
});

function SectionHeader({ title, icon: Icon, linkTo, actionLabel }: { title: string; icon: any; linkTo?: string; actionLabel?: string }) {
    return (
        <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
                <Icon className="h-4.5 w-4.5 text-cyan-400" />
                <h2 className="text-[15px] font-bold tracking-tight text-white">{title}</h2>
            </div>
            {linkTo && (
                <Link to={linkTo} className="text-[12px] font-semibold text-cyan-400/80 hover:text-cyan-300 transition-colors flex items-center gap-1">
                    {actionLabel || "View all"}
                    <ArrowRight className="h-3 w-3" />
                </Link>
            )}
        </div>
    );
}

// ─── Main Page ──────────────────────────────────────────────────────────────

export function AdminDashboardPage() {
    const { token } = useAuth();
    const [dashboard, setDashboard] = useState<AdminDashboardData>(emptyDashboard);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!token) return;
        const load = async () => {
            try {
                const result = await getAdminDashboard(token, 5);
                setDashboard(result.data || emptyDashboard);
            } catch (err) {
                console.error("Dashboard load failed", err);
            } finally {
                setLoading(false);
            }
        };
        void load();
    }, [token]);

    const statsData = useMemo(() => [
        { label: "Active Members", value: dashboard.counts.total_team_members, icon: UsersRound, trend: "+12%" },
        { label: "Pipeline Events", value: dashboard.counts.upcoming_events, icon: Calendar },
        { label: "Total Builds", value: dashboard.counts.total_projects, icon: FolderKanban },
        { label: "Resources", value: dashboard.counts.total_resources, icon: Library },
    ], [dashboard]);

    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
            </div>
        );
    }

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {/* Hero Summary */}
            <div className="relative overflow-hidden rounded-[2rem] border border-white/[0.08] bg-[#09101e]/40 p-10 backdrop-blur-md">
                <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-cyan-400/5 blur-[100px]" />
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="max-w-xl">
                        <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-cyan-300">
                            <Activity className="h-3 w-3" />
                            Operations Active
                        </div>
                        <h1 className="mt-4 font-display text-4xl font-bold tracking-tight text-white leading-[1.1]">
                            Control Center <span className="text-slate-500">Overview</span>
                        </h1>
                        <p className="mt-4 text-sm leading-7 text-slate-400">
                            Welcome back. You have <span className="text-cyan-300 font-bold">{dashboard.counts.total_team_members} total users</span> and <span className="text-white font-medium">{dashboard.counts.upcoming_events} scheduled events</span> in the pipeline.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <Link to="/admin/events" className="flex h-11 items-center gap-2 rounded-xl bg-white/[0.05] border border-white/[0.08] px-5 text-[13px] font-bold text-white transition-all hover:bg-white/[0.08]">
                            Schedule Event
                        </Link>
                        <Link to="/admin/users" className="flex h-11 items-center gap-2 rounded-xl bg-cyan-400 px-5 text-[13px] font-bold text-[#030711] shadow-[0_0_20px_rgba(34,211,238,0.2)] transition-all hover:scale-[1.02] hover:bg-cyan-300">
                            <Plus className="h-4 w-4" />
                            Add User
                        </Link>
                    </div>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {statsData.map((stat) => (
                    <OverviewStat key={stat.label} {...stat} />
                ))}
            </div>

            {/* Recent Activity Segments */}
            <div className="grid gap-8 lg:grid-cols-3">
                {/* Recent Events */}
                <div className="lg:col-span-2">
                    <SectionHeader title="Recent Events" icon={Calendar} linkTo="/admin/events" actionLabel="Manage Events" />
                    <div className="space-y-3">
                        {dashboard.recent_events.length > 0 ? (
                            dashboard.recent_events.slice(0, 5).map((event) => (
                                <div key={event.id} className="group flex items-center justify-between gap-4 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 transition-colors hover:bg-white/[0.04]">
                                    <div className="flex items-center gap-4">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-400/10 border border-cyan-400/20 text-cyan-400">
                                            <Calendar className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h4 className="text-[14px] font-bold text-white">{event.title}</h4>
                                            <p className="mt-0.5 text-[12px] text-slate-500">{event.date} • {event.location || event.venue || "TBD"}</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                        <span className="text-[11px] font-bold text-emerald-400">{(event as any).registered_count || 0} Registrations</span>
                                        <Link to={`/admin/events`} className="text-[10px] uppercase font-bold text-slate-500 hover:text-cyan-300 transition-colors">View Event</Link>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="flex h-32 flex-col items-center justify-center rounded-xl border border-dashed border-white/[0.08] text-slate-500">
                                <p className="text-sm font-medium">No recent events.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Insights Collapser */}
                <div className="space-y-8">
                    <section>
                        <SectionHeader title="Database Health" icon={BarChart3} />
                        <div className="rounded-2xl border border-white/[0.06] bg-[#050b18]/40 p-5 backdrop-blur-sm">
                            <div className="space-y-4">
                                {[
                                    { label: "Total Registrations", value: dashboard.counts.total_registrations },
                                    { label: "Public Members", value: dashboard.counts.total_public_team_members },
                                    { label: "Completed Events", value: dashboard.counts.past_events },
                                ].map((item) => (
                                    <div key={item.label} className="flex items-center justify-between">
                                        <span className="text-[12px] font-medium text-slate-500">{item.label}</span>
                                        <span className="text-[13px] font-bold text-slate-200">{item.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    <section>
                        <SectionHeader title="Recent Resources" icon={Library} linkTo="/admin/resources" />
                        <div className="space-y-2">
                            {dashboard.recent_resources.slice(0, 3).map(res => (
                                <div key={res.id} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/[0.03] transition-colors group">
                                    <div className="h-1.5 w-1.5 rounded-full bg-cyan-400/40 group-hover:bg-cyan-400 transition-colors" />
                                    <span className="text-[13px] text-slate-400 group-hover:text-slate-200 truncate">{res.title}</span>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}

