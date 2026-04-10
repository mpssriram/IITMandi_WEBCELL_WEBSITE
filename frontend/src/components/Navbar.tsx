import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";

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
        <header className="sticky top-0 z-50 border-b border-white/8 bg-ink-950/75 backdrop-blur-xl">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
                <a href="#top" className="group flex items-center gap-3">
                    <div className="grid h-11 w-11 place-items-center rounded-2xl border border-cyan-400/30 bg-cyan-400/10 text-sm font-bold text-cyan-100 shadow-glow transition group-hover:scale-105">
                        WC
                    </div>
                    <div>
                        <p className="font-display text-sm font-semibold uppercase tracking-[0.24em] text-slate-300">
                            IIT Mandi
                        </p>
                        <p className="font-display text-base font-semibold text-white">Dev Cell</p>
                    </div>
                </a>

                <nav className="hidden items-center gap-8 lg:flex">
                    {navLinks.map((link) => (
                        <a
                            key={link.href}
                            href={link.href}
                            className="rounded-full px-2 py-1 text-sm font-medium text-slate-300 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-950"
                        >
                            {link.label}
                        </a>
                    ))}
                </nav>

                <div className="hidden lg:block">
                    <a
                        href="#join"
                        className="inline-flex min-h-11 items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-5 py-2.5 text-sm font-semibold text-cyan-100 transition hover:-translate-y-0.5 hover:bg-cyan-400/15 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-950"
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

            {menuOpen ? (
                <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true">
                    <button
                        type="button"
                        aria-label="Close mobile menu"
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={() => setMenuOpen(false)}
                    />

                    <div id="mobile-nav" className="absolute inset-x-4 top-[5.2rem] rounded-3xl border border-white/10 bg-ink-950/95 p-3 shadow-glow">
                        {navLinks.map((link) => (
                            <a
                                key={link.href}
                                href={link.href}
                                onClick={() => setMenuOpen(false)}
                                className="flex min-h-12 items-center rounded-2xl px-4 py-3 text-base font-medium text-slate-200 transition hover:bg-white/5 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-950"
                            >
                                {link.label}
                            </a>
                        ))}

                        <a
                            href="#join"
                            onClick={() => setMenuOpen(false)}
                            className="mt-2 inline-flex min-h-12 w-full items-center justify-center rounded-2xl border border-cyan-400/30 bg-cyan-400/10 px-4 py-3 text-base font-semibold text-cyan-100 transition hover:bg-cyan-400/15 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-950"
                        >
                            Join the club
                        </a>
                    </div>
                </div>
            ) : null}
        </header>
    );
}