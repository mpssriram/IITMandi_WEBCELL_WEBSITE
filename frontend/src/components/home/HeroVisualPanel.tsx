import {
    BriefcaseBusiness,
    Code2,
    Figma,
    Globe,
    Server,
    Users,
} from "lucide-react";

import GlassIcons from "@/components/reactbits/GlassIcons";

const visualItems = [
    {
        icon: <Globe className="h-5 w-5 text-white" />,
        color: "blue",
        label: "Frontend",
    },
    {
        icon: <Server className="h-5 w-5 text-white" />,
        color: "indigo",
        label: "Backend",
    },
    {
        icon: <Figma className="h-5 w-5 text-white" />,
        color: "purple",
        label: "UI/UX",
    },
    {
        icon: <Code2 className="h-5 w-5 text-white" />,
        color: "green",
        label: "Open Source",
    },
    {
        icon: <BriefcaseBusiness className="h-5 w-5 text-white" />,
        color: "orange",
        label: "Projects",
    },
    {
        icon: <Users className="h-5 w-5 text-white" />,
        color: "red",
        label: "Community",
    },
];

type HeroVisualPanelProps = {
    projectCount: string;
    eventCount: string;
    teamCount: string;
};

export function HeroVisualPanel({ projectCount, eventCount, teamCount }: HeroVisualPanelProps) {
    return (
        <div className="relative overflow-hidden rounded-[2rem] border border-cyan-300/18 bg-[linear-gradient(160deg,rgba(8,18,36,0.9),rgba(4,8,18,0.92))] p-5 shadow-[0_30px_90px_-52px_rgba(34,211,238,0.55)] sm:p-6">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.16),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(99,102,241,0.16),transparent_24%)]" />

            <div className="relative">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-100/75">
                            Club stack
                        </p>
                        <h2 className="mt-2 font-display text-xl font-semibold text-white">
                            Cross-functional, not siloed
                        </h2>
                    </div>
                    <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-slate-300">
                        Reactbits visual
                    </div>
                </div>

                <div className="mt-6 rounded-[1.6rem] border border-white/10 bg-white/[0.04] px-3 py-6 sm:px-5">
                    <GlassIcons
                        items={visualItems}
                        className="grid-cols-3 gap-x-7 gap-y-10 py-1 text-slate-100 sm:gap-x-8"
                        activeIndex={2}
                    />
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-[1.4rem] border border-white/10 bg-black/20 p-4">
                        <p className="text-[11px] uppercase tracking-[0.22em] text-slate-400">Projects</p>
                        <p className="mt-2 font-display text-2xl font-semibold text-white">{projectCount}</p>
                        <p className="mt-2 text-sm leading-6 text-slate-300">Live previews and internal builds</p>
                    </div>
                    <div className="rounded-[1.4rem] border border-white/10 bg-black/20 p-4">
                        <p className="text-[11px] uppercase tracking-[0.22em] text-slate-400">Events</p>
                        <p className="mt-2 font-display text-2xl font-semibold text-white">{eventCount}</p>
                        <p className="mt-2 text-sm leading-6 text-slate-300">Workshops, sprints, and reviews</p>
                    </div>
                    <div className="rounded-[1.4rem] border border-white/10 bg-black/20 p-4">
                        <p className="text-[11px] uppercase tracking-[0.22em] text-slate-400">Community</p>
                        <p className="mt-2 font-display text-2xl font-semibold text-white">{teamCount}</p>
                        <p className="mt-2 text-sm leading-6 text-slate-300">Contributors visible across the club</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
