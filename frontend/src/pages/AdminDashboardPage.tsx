import { useEffect, useMemo, useState, memo } from "react";
import { Link } from "react-router-dom";
import { 
    Activity, 
    BarChart3, 
    ClipboardList, 
    ArrowRight, 
    UsersRound, 
    Calendar,
    Library,
    Plus
} from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { getAdminDashboard, type AdminDashboardData } from "@/lib/api";
import { ElectricCard } from "@/components/ElectricCard";

import FaultyTerminal from "@/components/reactbits/FaultyTerminal";

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

const MetricCard = memo(({ label, value, icon: Icon, color = "cyan" }: { label: string; value: string | number; icon: any; color?: string }) => {
    return (
        <div className="group relative overflow-hidden rounded-xl border border-white/[0.05] bg-[#0d121c] p-4 transition-all hover:border-white/[0.1] hover:bg-white/[0.02]">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500">{label}</p>
                    <h3 className="mt-1 text-2xl font-bold tracking-tight text-white">{value}</h3>
                </div>
                <div className={`flex h-9 w-9 items-center justify-center rounded-lg bg-${color}-500/10 border border-${color}-500/20 text-${color}-400 group-hover:scale-110 transition-transform`}>
                    <Icon className="h-4.5 w-4.5" />
                </div>
            </div>
        </div>
    );
});

function SectionHeader({ title, icon: Icon, linkTo, actionLabel }: { title: string; icon: any; linkTo?: string; actionLabel?: string }) {
    return (
        <div className="mb-4 flex items-center justify-between border-b border-white/[0.05] pb-2">
            <div className="flex items-center gap-2">
                <Icon className="h-4 w-4 text-cyan-400" />
                <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-200">{title}</h2>
            </div>
            {linkTo && (
                <Link to={linkTo} className="text-[10px] font-bold uppercase tracking-wider text-slate-500 hover:text-cyan-400 transition-colors">
                    {actionLabel || "Full List"}
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
                const result = await getAdminDashboard(token, 10);
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
        { label: "Total Users", value: dashboard.counts.total_team_members, icon: UsersRound },
        { label: "Planned Events", value: dashboard.counts.upcoming_events, icon: Calendar },
        { label: "Participants", value: dashboard.counts.total_registrations, icon: ClipboardList, color: "emerald" },
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
        <div className="space-y-6 animate-in fade-in duration-700">
            {/* Control Strip */}
            <div className="grid gap-4 lg:grid-cols-3">
                {/* System Health Ticker */}
                <div className="relative h-40 overflow-hidden rounded-xl border border-white/[0.05] bg-[#090d16]">
                    <div className="absolute inset-0 z-0">
                        <FaultyTerminal 
                            scale={1.5} 
                            brightness={0.4} 
                            tint="#06b6d4" 
                            scanlineIntensity={0.2} 
                            className="h-full w-full pointer-events-none" 
                        />
                    </div>
                    <div className="relative z-10 flex h-full flex-col justify-between p-5">
                        <div className="flex items-center gap-2">
                            <Activity className="h-3.5 w-3.5 text-cyan-400 animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-400">System Monitoring</span>
                        </div>
                        <div>
                            <div className="text-[11px] font-mono text-cyan-200/60 leading-tight">
                                CMD_EXEC: dashboard_v3.ready<br/>
                                SQL_POLL: {dashboard.counts.total_registrations} regs active<br/>
                                SYSTEM_LOAD: nominal
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Action Grid */}
                <div className="grid grid-cols-2 gap-2">
                    <Link to="/admin/events" className="flex flex-col items-center justify-center gap-2 rounded-xl border border-white/[0.05] bg-white/[0.02] p-4 transition-all hover:bg-cyan-500/10 hover:border-cyan-500/20 group text-center">
                        <Calendar className="h-5 w-5 text-slate-500 group-hover:text-cyan-400" />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 group-hover:text-cyan-400">Schedule Event</span>
                    </Link>
                    <Link to="/admin/users" className="flex flex-col items-center justify-center gap-2 rounded-xl border border-white/[0.05] bg-white/[0.02] p-4 transition-all hover:bg-emerald-500/10 hover:border-emerald-500/20 group text-center">
                        <Plus className="h-5 w-5 text-slate-500 group-hover:text-emerald-400" />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 group-hover:text-emerald-400">New User</span>
                    </Link>
                </div>

                {/* Quick System Summary */}
                <div className="flex flex-col justify-between rounded-xl border border-white/[0.05] bg-[#0d121c] p-5">
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">DATABASE SIZE</span>
                            <span className="text-[12px] font-mono text-slate-200">{(dashboard.counts.total_events + dashboard.counts.total_resources + dashboard.counts.total_team_members).toLocaleString()} records</span>
                        </div>
                        <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-cyan-500 transition-all duration-1000" style={{ width: '70%' }} />
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium">
                            <span>UPTIME: 99.9%</span>
                            <span>REGIONS: GLOBAL</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Core Metrics Grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {statsData.map((stat) => (
                    <MetricCard key={stat.label} {...stat} />
                ))}
            </div>

            {/* Operational Viewports */}
            <div className="grid gap-6 lg:grid-cols-12">
                {/* Event Pipeline */}
                <div className="lg:col-span-8">
                    <SectionHeader title="Event Pipeline" icon={Calendar} linkTo="/admin/events" />
                    <div className="overflow-hidden rounded-xl border border-white/[0.05] bg-[#090d16]">
                        <table className="w-full text-left">
                            <thead className="bg-white/[0.02] border-b border-white/[0.05]">
                                <tr>
                                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">Event Title</th>
                                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">Timeline</th>
                                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">Regs</th>
                                    <th className="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-slate-500">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/[0.05]">
                                {dashboard.recent_events.length > 0 ? (
                                    dashboard.recent_events.slice(0, 6).map((event) => {
                                        const isFull = (event as any).is_full || false;
                                        return (
                                            <tr key={event.id} className="group hover:bg-white/[0.02] transition-colors">
                                                <td className="px-4 py-3 text-[13px] font-semibold text-slate-200">{event.title}</td>
                                                <td className="px-4 py-3 text-[11px] text-slate-500">{event.date}</td>
                                                <td className="px-4 py-3">
                                                    <span className={`text-[11px] font-bold ${isFull ? 'text-amber-400' : 'text-emerald-400'}`}>
                                                        {(event as any).registered_count || 0}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-tighter ${isFull ? 'bg-amber-400/10 text-amber-400' : 'bg-cyan-400/10 text-cyan-400'}`}>
                                                        {isFull ? 'FULL' : 'ACTIVE'}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="px-4 py-10 text-center text-sm text-slate-500">No events found</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Resource List / Health Details */}
                <div className="lg:col-span-4 space-y-6">
                    <div>
                        <SectionHeader title="Database Insight" icon={BarChart3} />
                        <div className="grid grid-cols-2 gap-3">
                            <div className="rounded-xl border border-white/[0.05] bg-white/[0.01] p-3">
                                <span className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Applications</span>
                                <span className="text-xl font-bold text-slate-200">{dashboard.counts.total_join_applications}</span>
                            </div>
                            <div className="rounded-xl border border-white/[0.05] bg-white/[0.01] p-3">
                                <span className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Full Events</span>
                                <span className="text-xl font-bold text-amber-500">{dashboard.counts.full_events}</span>
                            </div>
                        </div>
                    </div>

                    <div>
                        <SectionHeader title="Latest Resources" icon={Library} linkTo="/admin/resources" />
                        <div className="space-y-1.5 font-mono">
                            {dashboard.recent_resources.slice(0, 5).map(res => (
                                <div key={res.id} className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/[0.01] hover:bg-white/[0.04] transition-colors group">
                                    <span className="text-[11px] text-slate-400 truncate max-w-[150px]">{res.title}</span>
                                    <span className="text-[9px] uppercase font-bold text-slate-600 bg-white/5 px-1.5 rounded">{res.type || 'file'}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

