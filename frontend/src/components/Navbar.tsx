import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { navLinks } from "@/data/site";

export function Navbar() {
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        document.body.style.overflow = menuOpen ? "hidden" : "";
        return () => {
            document.body.style.overflow = "";
        };
    }, [menuOpen]);

    useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setMenuOpen(false);
            }
        };

        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, []);

    return (
        <header className="sticky top-0 z-50 px-3 pt-3 sm:px-4 sm:pt-4">
            <div className="mx-auto max-w-[88rem] rounded-[1.7rem] border border-white/10 bg-[linear-gradient(180deg,rgba(6,12,24,0.9),rgba(4,8,18,0.72))] shadow-[0_20px_70px_-40px_rgba(34,211,238,0.45)] backdrop-blur-xl">
                <div className="flex items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-7">
                    <a href="#top" className="group flex min-w-0 items-center gap-3">
                        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-cyan-400/30 bg-cyan-400/10 text-sm font-bold text-cyan-100 shadow-[0_14px_34px_-20px_rgba(34,211,238,0.8)] transition group-hover:scale-105">
                            WD
                        </div>
                        <div className="min-w-0">
                            <p className="truncate font-display text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">
                                IIT Mandi
                            </p>
                            <p className="truncate font-display text-base font-semibold text-white">
                                Web Development Club
                            </p>
                        </div>
                    </a>

                    <nav className="hidden items-center gap-1 rounded-full border border-white/10 bg-white/[0.03] px-2 py-2 lg:flex">
                        {navLinks.map((link) => (
                            <a
                                key={link.href}
                                href={link.href}
                                className="rounded-full px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/6 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-950"
                            >
                                {link.label}
                            </a>
                        ))}
                    </nav>

                    <div className="hidden items-center gap-3 lg:flex">
                        <Link
                            to="/login"
                            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/12 bg-white/[0.04] px-5 py-2.5 text-sm font-semibold text-slate-100 transition hover:-translate-y-0.5 hover:border-cyan-300/35 hover:bg-cyan-400/10 hover:text-white"
                        >
                            Login
                        </Link>
                        <a
                            href="#join"
                            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-cyan-300 px-5 py-2.5 text-sm font-semibold text-[#04101b] transition hover:-translate-y-0.5 hover:bg-cyan-200"
                        >
                            Join the club
                        </a>
                    </div>

                    <button
                        type="button"
                        onClick={() => setMenuOpen((current) => !current)}
                        className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 p-3 text-slate-100 lg:hidden"
                        aria-label={menuOpen ? "Close menu" : "Open menu"}
                        aria-expanded={menuOpen}
                        aria-controls="mobile-nav"
                    >
                        {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </button>
                </div>
            </div>

            {menuOpen ? (
                <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true">
                    <button
                        type="button"
                        aria-label="Close mobile menu"
                        className="absolute inset-0 bg-black/65 backdrop-blur-sm"
                        onClick={() => setMenuOpen(false)}
                    />

                    <div
                        id="mobile-nav"
                        className="absolute inset-x-4 top-[5.4rem] rounded-[1.8rem] border border-white/10 bg-[linear-gradient(180deg,rgba(6,12,24,0.96),rgba(4,8,18,0.94))] p-3 shadow-[0_20px_80px_-34px_rgba(34,211,238,0.45)]"
                    >
                        {navLinks.map((link) => (
                            <a
                                key={link.href}
                                href={link.href}
                                onClick={() => setMenuOpen(false)}
                                className="flex min-h-12 items-center rounded-2xl px-4 py-3 text-base font-medium text-slate-200 transition hover:bg-white/5 hover:text-white"
                            >
                                {link.label}
                            </a>
                        ))}

                        <div className="mt-3 grid gap-2">
                            <Link
                                to="/login"
                                onClick={() => setMenuOpen(false)}
                                className="inline-flex min-h-12 w-full items-center justify-center rounded-2xl border border-white/12 bg-white/[0.04] px-4 py-3 text-base font-semibold text-slate-100 transition hover:border-cyan-400/30 hover:bg-cyan-400/10 hover:text-white"
                            >
                                Login
                            </Link>
                            <a
                                href="#join"
                                onClick={() => setMenuOpen(false)}
                                className="inline-flex min-h-12 w-full items-center justify-center rounded-2xl bg-cyan-300 px-4 py-3 text-base font-semibold text-[#04101b] transition hover:bg-cyan-200"
                            >
                                Join the club
                            </a>
                        </div>
                    </div>
                </div>
            ) : null}
        </header>
    );
}
