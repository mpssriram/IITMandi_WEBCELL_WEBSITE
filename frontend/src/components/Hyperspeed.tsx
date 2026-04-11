import { useMemo } from "react";

interface HyperspeedProps {
    density?: number;
    className?: string;
}

export function Hyperspeed({ density = 34, className = "" }: HyperspeedProps) {
    const streaks = useMemo(
        () =>
            Array.from({ length: density }, (_, index) => ({
                id: index,
                left: `${(index * 31) % 100}%`,
                delay: `${(index % 11) * 0.37}s`,
                duration: `${3.4 + (index % 7) * 0.45}s`,
                opacity: 0.18 + (index % 5) * 0.1,
                width: `${1 + (index % 3)}px`,
            })),
        [density],
    );

    return (
        <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(14,165,233,0.2),transparent_48%),linear-gradient(180deg,rgba(5,8,22,0.35),rgba(5,8,22,0.82))]" />
            {streaks.map((streak) => (
                <span
                    key={streak.id}
                    className="absolute top-[-20%] block h-[26vh] rounded-full bg-gradient-to-b from-cyan-200/0 via-cyan-200/60 to-cyan-200/0 blur-[0.5px]"
                    style={{
                        left: streak.left,
                        width: streak.width,
                        opacity: streak.opacity,
                        animationName: "hyperspeed-fall",
                        animationDelay: streak.delay,
                        animationDuration: streak.duration,
                        animationIterationCount: "infinite",
                        animationTimingFunction: "linear",
                    }}
                />
            ))}
        </div>
    );
}
