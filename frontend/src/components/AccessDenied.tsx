import { ArrowLeft, Home, ShieldX } from "lucide-react";
import { Link } from "react-router-dom";

export function AccessDenied({ message }: { message?: string }) {
    return (
        <div className="grid min-h-[60vh] place-items-center px-4 py-10">
            <div className="w-full max-w-xl rounded-3xl border border-cyan-300/15 bg-[linear-gradient(180deg,rgba(5,12,24,0.96),rgba(4,8,18,0.9))] p-6 text-center shadow-[0_28px_100px_-60px_rgba(34,211,238,0.45)] sm:p-8">
                <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl border border-cyan-300/25 bg-cyan-300/10 text-cyan-100">
                    <ShieldX className="h-6 w-6" />
                </div>
                <h1 className="mt-4 font-display text-2xl font-semibold text-white">Access Denied</h1>
                <p className="mt-3 text-sm leading-7 text-slate-300">
                    {message || "Your account is authenticated, but it does not have admin privileges for this route."}
                </p>
                <p className="mt-2 text-xs uppercase tracking-[0.2em] text-cyan-100/70">Admin privileges required</p>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
                    <Link
                        to="/"
                        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-cyan-400 px-5 py-2 text-sm font-semibold text-ink-950 transition hover:bg-cyan-300"
                    >
                        <Home className="h-4 w-4" />
                        Back home
                    </Link>
                    <Link
                        to="/admin/login"
                        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-white/12 bg-white/5 px-5 py-2 text-sm font-semibold text-white transition hover:border-cyan-300/30 hover:bg-cyan-300/10"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Admin login
                    </Link>
                </div>
            </div>
        </div>
    );
}
