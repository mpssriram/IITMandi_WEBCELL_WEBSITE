import { Suspense, useMemo } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { 
    LayoutDashboard, 
    Users, 
    Calendar, 
    Library, 
    LogOut,
    ChevronRight,
    UserCircle
} from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import Orb from "@/components/reactbits/Orb";

interface NavItemProps {
    to: string;
    icon: React.ElementType;
    label: string;
    end?: boolean;
}

function NavItem({ to, icon: Icon, label, end }: NavItemProps) {
    return (
        <NavLink
            to={to}
            end={end}
            className={({ isActive }) =>
                `group flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium transition-all duration-200 ${
                    isActive
                        ? "bg-cyan-400/10 text-cyan-300 shadow-[inset_0_0_12px_rgba(34,211,238,0.05)]"
                        : "text-slate-400 hover:bg-white/[0.04] hover:text-slate-200"
                }`
            }
        >
            <Icon className="h-4.5 w-4.5 shrink-0 transition-colors group-hover:text-cyan-300" />
            <span className="flex-1">{label}</span>
            <ChevronRight className="h-3.5 w-3.5 opacity-0 transition-all -translate-x-1 group-hover:opacity-40 group-hover:translate-x-0 group-[.active]:opacity-20" />
        </NavLink>
    );
}

export function AdminAreaLayout() {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const handleSignOut = async () => {
        try {
            await logout();
            navigate("/", { replace: true });
        } catch (error) {
            console.error("Sign out failed", error);
        }
    };

    const breadcrumbs = useMemo(() => {
        const parts = location.pathname.split("/").filter(Boolean);
        return parts.map((part) => part.charAt(0).toUpperCase() + part.slice(1));
    }, [location.pathname]);

    return (
        <div className="relative flex min-h-screen bg-[#05080d] text-slate-200">
            {/* Sidebar */}
            <aside className="sticky top-0 h-screen w-64 shrink-0 border-r border-white/[0.05] bg-[#090d16] shadow-2xl z-40">
                <div className="flex h-full flex-col">
                    {/* Brand Section */}
                    <div className="flex h-16 items-center border-b border-white/[0.05] px-6 bg-white/[0.01]">
                        <Link to="/" className="flex items-center gap-3">
                            <div className="h-2.5 w-2.5 rounded-full bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.6)] animate-pulse" />
                            <span className="font-display text-[15px] font-black tracking-widest text-white uppercase">IITM_WEBCELL</span>
                        </Link>
                    </div>

                    {/* Navigation Groups */}
                    <div className="flex-1 overflow-y-auto py-8 px-4 space-y-8">
                        <div>
                            <h3 className="mb-4 px-3 text-[10px] font-black uppercase tracking-[0.3em] text-slate-600">Core_Systems</h3>
                            <div className="space-y-1">
                                <NavItem to="/admin/dashboard" icon={LayoutDashboard} label="MONITOR" end />
                                <NavItem to="/admin/users" icon={Users} label="USER_REGISTRY" />
                                <NavItem to="/admin/events" icon={Calendar} label="EVENT_PIPELINE" />
                                <NavItem to="/admin/resources" icon={Library} label="ARCHIVE_NODES" />
                            </div>
                        </div>

                        {/* Future Expansion Slot */}
                        <div className="pt-4 opacity-30 pointer-events-none">
                            <h3 className="mb-4 px-3 text-[10px] font-black uppercase tracking-[0.3em] text-slate-800">Operational_Extensions</h3>
                            <div className="h-20 border border-dashed border-slate-800 rounded-lg" />
                        </div>
                    </div>

                    {/* Profile Footer */}
                    <div className="border-t border-white/[0.05] bg-[#0d121c] p-5">
                        <div className="group relative flex items-center gap-3 rounded-xl bg-white/[0.02] p-3 border border-white/[0.05] transition-colors hover:bg-white/[0.04]">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                                <UserCircle className="h-6 w-6 text-cyan-400" />
                            </div>
                            <div className="flex flex-col overflow-hidden">
                                <span className="truncate text-[12px] font-black text-slate-200 uppercase tracking-tight">{user?.displayName || "SYSOPS_ADMIN"}</span>
                                <span className="truncate text-[10px] font-mono text-slate-500 lowercase opacity-60">{user?.email}</span>
                            </div>
                        </div>
                        <button
                            onClick={handleSignOut}
                            className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 transition-all hover:bg-rose-500/10 hover:text-rose-400 border border-transparent hover:border-rose-500/20 active:scale-95"
                        >
                            <LogOut className="h-3.5 w-3.5" />
                            Purge_Session
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex flex-1 flex-col min-w-0">
                {/* Clean Top Bar */}
                <header className="flex h-16 items-center justify-between border-b border-white/[0.05] bg-[#090d16]/80 backdrop-blur-xl px-10 sticky top-0 z-30">
                    <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] font-mono">
                        <span className="text-slate-700">ROOT</span>
                        {breadcrumbs.map((part, i) => (
                            <span key={part} className="flex items-center gap-3">
                                <ChevronRight className="h-3 w-3 text-slate-800" />
                                <span className={i === breadcrumbs.length - 1 ? "text-cyan-400" : "text-slate-500"}>
                                    {part.toUpperCase()}
                                </span>
                            </span>
                        ))}
                    </div>
                    
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2 text-[10px] font-black text-emerald-500 bg-emerald-500/5 px-3 py-1.5 rounded-full border border-emerald-500/10">
                            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" />
                            SYSTEM_ONLINE
                        </div>
                    </div>
                </header>

                {/* Content Viewport */}
                <main className="flex-1 p-10 bg-[#05080d]">
                    <div className="mx-auto max-w-7xl">
                        <Suspense fallback={
                            <div className="flex h-64 items-center justify-center flex-col gap-4">
                                <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent shadow-[0_0_15px_rgba(34,211,238,0.2)]" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 animate-pulse">Initializing_Node...</span>
                            </div>
                        }>
                            <Outlet />
                        </Suspense>
                    </div>
                </main>
            </div>
        </div>
    );
}

