type SectionHeadingProps = {
    eyebrow: string;
    title: string;
    description: string;
};

export function SectionHeading({ eyebrow, title, description }: SectionHeadingProps) {
    return (
        <div className="max-w-3xl">
            <p className="font-display text-xs font-semibold uppercase tracking-[0.24em] text-accent-300 sm:text-sm">
                {eyebrow}
            </p>
            <div className="mt-3 h-px w-24 bg-gradient-to-r from-cyan-300/80 to-transparent" />
            <h2 className="mt-4 text-balance font-display text-[clamp(1.7rem,5vw,3rem)] font-semibold tracking-tight text-white">
                {title}
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
                {description}
            </p>
        </div>
    );
}