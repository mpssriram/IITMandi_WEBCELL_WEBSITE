import { ArrowUpRight } from "lucide-react";

import { navLinks, socialLinks } from "@/data/site";

export function Footer() {
    return (
        <footer className="mx-auto mt-10 max-w-[88rem] px-4 pb-6 sm:px-6 lg:px-8">
            <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(5,10,22,0.92),rgba(3,7,16,0.92))] shadow-[0_28px_90px_-52px_rgba(34,211,238,0.45)]">
                <div className="grid gap-10 px-6 py-8 sm:px-8 sm:py-10 lg:grid-cols-[1.2fr_0.8fr_0.8fr] lg:px-10">
                    <div>
                        <p className="font-display text-2xl font-semibold text-white">Web Development Club</p>
                        <p className="mt-2 text-sm uppercase tracking-[0.24em] text-cyan-100/70">IIT Mandi</p>
                        <p className="mt-5 max-w-md text-sm leading-7 text-slate-300">
                            A student community for builders, designers, and organizers who want to learn by shipping
                            credible web experiences with real collaboration and review culture.
                        </p>
                    </div>

                    <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
                            Explore
                        </p>
                        <div className="mt-4 grid gap-2">
                            {navLinks.map((link) => (
                                <a
                                    key={link.href}
                                    href={link.href}
                                    className="text-sm text-slate-300 transition hover:text-white"
                                >
                                    {link.label}
                                </a>
                            ))}
                        </div>
                    </div>

                    <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
                            Connect
                        </p>
                        <div className="mt-4 flex flex-wrap gap-3">
                            {socialLinks.map((link) =>
                                link.href && !link.href.startsWith("#") ? (
                                    <a
                                        key={link.label}
                                        href={link.href}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-cyan-400/30 hover:bg-cyan-400/10 hover:text-white"
                                    >
                                        {link.label}
                                        <ArrowUpRight className="h-4 w-4" />
                                    </a>
                                ) : (
                                    <span
                                        key={link.label}
                                        className="inline-flex min-h-11 cursor-not-allowed items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm font-medium text-slate-400"
                                    >
                                        {link.label}
                                        <span className="rounded-full border border-white/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.15em]">
                                            Soon
                                        </span>
                                    </span>
                                ),
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/8 px-6 py-4 text-xs text-slate-500 sm:px-8 lg:px-10">
                    <p>Built for the IIT Mandi Web Development Club. Public homepage with Firebase auth and API-backed club content.</p>
                    <a
                        href="/admin/login"
                        className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1 font-semibold text-amber-200/80 transition hover:border-amber-400/40 hover:text-amber-200"
                    >
                        Admin Portal Access
                    </a>
                </div>
            </div>
        </footer>
    );
}
