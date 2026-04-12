import { ReactNode } from "react";

interface ElectricCardProps {
    children: ReactNode;
    className?: string;
    intensity?: "soft" | "medium";
}

export function ElectricCard({ children, className = "", intensity = "medium" }: ElectricCardProps) {
    const glowClass =
        intensity === "soft"
            ? "shadow-[0_2px_16px_-8px_rgba(34,211,238,0.18)]"
            : "shadow-[0_2px_20px_-8px_rgba(34,211,238,0.22)]";

    return (
        <div
            className={`group relative overflow-hidden rounded-[1.75rem] border border-cyan-300/20 bg-[#071225]/88 ${glowClass} transition-colors duration-200 hover:border-cyan-300/35 ${className}`}
        >
            <div className="relative">{children}</div>
        </div>
    );
}
