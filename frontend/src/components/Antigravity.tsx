interface AntigravityProps {
    className?: string;
}

export function Antigravity({ className = "" }: AntigravityProps) {
    return (
        <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden>
            <div className="absolute inset-0 bg-[linear-gradient(180deg,#061022,#0a1730)]" />
            <span className="absolute left-[14%] top-[70%] h-20 w-20 rounded-full bg-cyan-300/20 blur-2xl animate-[anti-rise_9s_ease-in-out_infinite]" />
            <span className="absolute left-[42%] top-[78%] h-14 w-14 rounded-full bg-sky-300/25 blur-xl animate-[anti-rise_8s_ease-in-out_infinite_0.8s]" />
            <span className="absolute left-[68%] top-[72%] h-24 w-24 rounded-full bg-blue-300/20 blur-2xl animate-[anti-rise_10s_ease-in-out_infinite_0.4s]" />
            <span className="absolute left-[84%] top-[80%] h-10 w-10 rounded-full bg-cyan-100/20 blur-lg animate-[anti-rise_7s_ease-in-out_infinite_1s]" />
        </div>
    );
}
