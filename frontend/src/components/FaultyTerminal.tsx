interface FaultyTerminalProps {
    className?: string;
}

export function FaultyTerminal({ className = "" }: FaultyTerminalProps) {
    return (
        <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden>
            <div className="absolute inset-0 bg-[linear-gradient(180deg,#030712,#071327)]" />
            <div className="absolute inset-0 opacity-30 [background-size:100%_3px] [background-image:linear-gradient(to_bottom,rgba(56,189,248,0.25)_1px,transparent_1px)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(14,165,233,0.2),transparent_35%),radial-gradient(circle_at_85%_80%,rgba(34,211,238,0.2),transparent_36%)]" />
            <div className="absolute -left-full top-0 h-full w-[55%] bg-gradient-to-r from-transparent via-cyan-200/12 to-transparent animate-[fault-scan_5.5s_linear_infinite]" />
        </div>
    );
}
