import type { PropsWithChildren } from "react";

type RevealProps = PropsWithChildren<{
    className?: string;
    delay?: number;
}>;

export function Reveal({ children, className }: RevealProps) {
    // Stripped framer-motion for performance. Large grids with intersection observers 
    // were causing massive layout layout lag in the user area.
    return <div className={`animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both ${className || ""}`}>{children}</div>;
}