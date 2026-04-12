import { Suspense, useMemo } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { 
    LayoutDashboard, 
    Users, 
    Calendar, 
    FolderKanban, 
    Library, 
    Settings,
    Bell,
    LogOut,
    ChevronRight,
    Search,
    UserCircle
} from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import GridScan from "@/components/GridScan";

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
    const { user, isAdmin } = useAuth();
    const location = useLocation();

    const breadcrumbs = useMemo(() => {
        const parts = location.pathname.split("/").filter(Boolean);
        return parts.map((part) => part.charAt(0).toUpperCase() + part.slice(1));
    }, [location.pathname]);

    return (
        <div className="relative flex min-h-screen bg-[#030711] text-white">
            {/* ── Background Identity Layer ── */}
            <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden opacity-30">
                <GridScan 
                    mainColor="rgba(34, 211, 238, 0.15)"
                    secondaryColor="rgba(15, 23, 42, 0.4)"
                    gridSize={45}
                    className="h-full w-full"
                />
            </div>

            {/* ── Sidebar ── */}
            <aside className="sticky top-0 h-screen w-64 shrink-0 border-r border-white/[0.06] bg-[#050b18]/60 backdrop-blur-md">
                <div className="flex h-full flex-col p-4">
                    {/* Brand */}
                    <div className="mb-8 px-2 py-4">
                        <Link to="/" className="flex items-center gap-2.5 group">
                            <div className="h-6 w-6 rounded-md bg-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.4)] transition-transform group-hover:scale-105" />
                            <div className="flex flex-col">
                                <span className="font-display text-[15px] font-bold tracking-tight text-white">Dev Cell</span>
                                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-400/80">Admin Core</span>
                            </div>
                        </Link>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 space-y-1">
                        <div className="mb-4 px-3">
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Workspace</span>
                        </div>
                        <NavItem to="/admin/dashboard" icon={LayoutDashboard} label="Dashboard" end />
                        <NavItem to="/admin/users" icon={Users} label="Users" />
                        <NavItem to="/admin/events" icon={Calendar} label="Events" />
                        <NavItem to="/admin/projects" icon={FolderKanban} label="Projects" />
                        <NavItem to="/admin/resources" icon={Library} label="Resources" />
                        <NavItem to="/admin/announcements" icon={Bell} label="Announcements" />
                    </nav>

                    {/* Account Wrapper */}
                    <div className="mt-auto border-t border-white/[0.06] pt-4">
                        <div className="mb-4 flex items-center gap-3 px-3 py-2 rounded-xl bg-white/[0.03]">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-400/10 border border-cyan-400/20">
                                <UserCircle className="h-5 w-5 text-cyan-300" />
                            </div>
                            <div className="flex flex-col overflow-hidden">
                                <span className="truncate text-xs font-semibold text-slate-200">{user?.displayName || "Admin User"}</span>
                                <span className="truncate text-[10px] text-slate-500">{user?.email}</span>
                            </div>
                        </div>
                        <button className="flex w-full items-center gap-2 px-3 py-2 text-[13px] font-medium text-slate-400 transition-colors hover:text-rose-400">
                            <LogOut className="h-4 w-4" />
                            Sign Out
                        </button>
                    </div>
                </div>
            </aside>

            {/* ── Main Content Area ── */}
            <div className="flex flex-1 flex-col overflow-hidden">
                {/* Header */}
                <header className="flex h-16 items-center justify-between border-b border-white/[0.06] bg-[#030711]/40 px-8 backdrop-blur-sm">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-[13px] font-medium">
                            {breadcrumbs.map((part, i) => (
                                <span key={part} className="flex items-center gap-2">
                                    {i > 0 && <ChevronRight className="h-3 w-3 text-slate-600" />}
                                    <span className={i === breadcrumbs.length - 1 ? "text-cyan-300" : "text-slate-500"}>
                                        {part}
                                    </span>
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="relative group">
                            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500 transition-colors group-focus-within:text-cyan-400" />
                            <input 
                                type="text" 
                                placeholder="Search admin console..." 
                                className="h-9 w-64 rounded-lg border border-white/[0.08] bg-white/[0.03] pl-9 pr-4 text-[13px] text-slate-200 placeholder:text-slate-500 focus:border-cyan-400/40 focus:bg-white/[0.06] focus:outline-none focus:ring-1 focus:ring-cyan-400/20"
                            />
                        </div>
                        <div className="h-4 w-px bg-white/[0.08]" />
                        <button className="relative rounded-lg p-2 text-slate-400 hover:bg-white/[0.04] hover:text-slate-200">
                            <Bell className="h-4.5 w-4.5" />
                            <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-cyan-400" />
                        </button>
                        <button className="rounded-lg p-2 text-slate-400 hover:bg-white/[0.04] hover:text-slate-200">
                            <Settings className="h-4.5 w-4.5" />
                        </button>
                    </div>
                </header>

                {/* Content Viewport */}
                <main className="flex-1 overflow-y-auto overflow-x-hidden p-8">
                    <div className="mx-auto max-w-7xl">
                        <Suspense fallback={
                            <div className="flex h-64 items-center justify-center">
                                <div className="h-6 w-6 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
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
