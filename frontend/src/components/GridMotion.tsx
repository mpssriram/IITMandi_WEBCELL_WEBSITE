interface GridMotionProps {
    className?: string;
}

export function GridMotion({ className = "" }: GridMotionProps) {
    return (
        <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden>
            <div className="absolute inset-0 bg-[linear-gradient(180deg,#040917,#08152c)]" />
            <div className="absolute inset-0 opacity-30 [background-size:38px_38px] [background-image:linear-gradient(rgba(125,211,252,0.24)_1px,transparent_1px),linear-gradient(90deg,rgba(125,211,252,0.24)_1px,transparent_1px)]" />
            <div className="absolute inset-y-0 -left-1/3 w-1/3 bg-gradient-to-r from-transparent via-cyan-300/15 to-transparent animate-[grid-slide_7s_linear_infinite]" />
        </div>
    );
}
