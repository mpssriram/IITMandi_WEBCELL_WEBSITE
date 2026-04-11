import { ReactNode } from "react";

interface ElectricCardProps {
    children: ReactNode;
    className?: string;
    intensity?: "soft" | "medium";
}

export function ElectricCard({ children, className = "", intensity = "medium" }: ElectricCardProps) {
    const glowClass =
        intensity === "soft"
            ? "shadow-[0_16px_50px_-30px_rgba(34,211,238,0.45)]"
            : "shadow-[0_22px_70px_-28px_rgba(34,211,238,0.55)]";

    return (
        <div
            className={`group relative overflow-hidden rounded-[1.75rem] border border-cyan-300/20 bg-[#071225]/88 ${glowClass} transition duration-300 hover:-translate-y-1 hover:border-cyan-300/35 ${className}`}
        >
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(34,211,238,0.2),transparent_28%,transparent_72%,rgba(14,165,233,0.22))] opacity-55 transition duration-300 group-hover:opacity-80" />
            <div className="pointer-events-none absolute -inset-x-10 -top-14 h-28 bg-[radial-gradient(circle,rgba(56,189,248,0.45),transparent_62%)] opacity-40 blur-2xl" />
            <div className="relative">{children}</div>
        </div>
    );
}
