import { ArrowUpRight } from "lucide-react";

import { socialLinks } from "@/data/site";

export function Footer() {
    return (
        <footer className="border-t border-white/8 bg-black/20">
            <div className="mx-auto grid max-w-[84rem] gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1.55fr_1fr] lg:px-8">
                <div className="text-center sm:text-left">
                    <p className="font-display text-xl font-semibold text-white sm:text-2xl">Dev Cell, IIT Mandi</p>
                    <p className="mt-3 max-w-xl text-sm leading-7 text-slate-400">
                        A student community for builders, designers, and organizers who want to learn by shipping real web experiences.
                    </p>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-3 sm:justify-start lg:justify-end">
                    {socialLinks.map((link) => (
                        link.href && !link.href.startsWith("#") ? (
                            <a
                                key={link.label}
                                href={link.href}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-cyan-400/30 hover:bg-cyan-400/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-950"
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
                                <span className="rounded-full border border-white/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.15em]">Soon</span>
                            </span>
                        )
                    ))}
                </div>
            </div>

            <div className="border-t border-white/8">
                <div className="mx-auto flex max-w-[84rem] flex-col gap-2 px-4 py-4 text-center text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:text-left lg:px-8">
                    <span>Built for the IIT Mandi Web Development Club.</span>
                    <span>Live Firebase auth with API-backed content.</span>
                </div>
            </div>
        </footer>
    );
}
