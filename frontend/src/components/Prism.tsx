interface PrismProps {
    className?: string;
}

export function Prism({ className = "" }: PrismProps) {
    return (
        <div className={`relative overflow-hidden rounded-[2rem] border border-cyan-300/20 bg-[#06122a] ${className}`}>
            <div className="absolute inset-0 bg-[conic-gradient(from_210deg_at_50%_50%,rgba(34,211,238,0.26),rgba(8,47,73,0.15),rgba(56,189,248,0.2),rgba(2,6,23,0.18),rgba(34,211,238,0.26))]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_22%_18%,rgba(125,211,252,0.24),transparent_40%),radial-gradient(circle_at_84%_76%,rgba(14,165,233,0.22),transparent_36%)]" />
            <div className="absolute inset-0 backdrop-blur-[2px]" />
        </div>
    );
}
