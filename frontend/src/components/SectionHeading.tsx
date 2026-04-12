type SectionHeadingProps = {
    eyebrow: string;
    title: string;
    description: string;
};

export function SectionHeading({ eyebrow, title, description }: SectionHeadingProps) {
    return (
        <div className="max-w-3xl">
            <p className="font-display text-[11px] font-semibold uppercase tracking-[0.24em] text-accent-300 sm:text-xs">
                {eyebrow}
            </p>
            <div className="mt-3 h-px w-24 bg-gradient-to-r from-cyan-300/80 to-transparent" />
            <h2 className="mt-4 text-balance font-display text-[clamp(1.5rem,4vw,2.45rem)] font-semibold tracking-tight text-white">
                {title}
            </h2>
            <p className="mt-4 max-w-2xl text-[13px] leading-6 text-slate-300 sm:text-[15px] sm:leading-7">
                {description}
            </p>
        </div>
    );
}
