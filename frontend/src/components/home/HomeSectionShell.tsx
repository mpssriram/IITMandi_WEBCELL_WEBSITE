import type { PropsWithChildren } from "react";

type HomeSectionShellProps = PropsWithChildren<{
    id?: string;
    className?: string;
    innerClassName?: string;
    glowClassName?: string;
}>;

export function HomeSectionShell({
    id,
    className = "",
    innerClassName = "",
    glowClassName = "",
    children,
}: HomeSectionShellProps) {
    return (
        <section id={id} className={`mx-auto max-w-[88rem] px-4 py-4 sm:px-6 lg:px-8 ${className}`}>
            <div
                className={`relative overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(6,12,24,0.92),rgba(4,8,18,0.84))] shadow-[0_32px_100px_-58px_rgba(15,118,185,0.55)] backdrop-blur-xl ${innerClassName}`}
            >
                <div
                    className={`pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.14),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.12),transparent_24%)] ${glowClassName}`}
                />
                <div className="relative">{children}</div>
            </div>
        </section>
    );
}
