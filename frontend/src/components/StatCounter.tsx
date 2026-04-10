import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "framer-motion";

type StatCounterProps = {
    value: number;
    suffix?: string;
    label: string;
};

export function StatCounter({ value, suffix = "", label }: StatCounterProps) {
    const ref = useRef<HTMLDivElement | null>(null);
    const inView = useInView(ref, { once: true, margin: "-80px" });
    const prefersReducedMotion = useReducedMotion();
    const [displayValue, setDisplayValue] = useState(0);

    useEffect(() => {
        if (!inView) {
            return;
        }

        if (prefersReducedMotion) {
            setDisplayValue(value);
            return;
        }

        let animationFrame = 0;
        const start = performance.now();
        const duration = 1200;

        const tick = (now: number) => {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setDisplayValue(Math.round(value * eased));

            if (progress < 1) {
                animationFrame = requestAnimationFrame(tick);
            }
        };

        animationFrame = requestAnimationFrame(tick);

        return () => cancelAnimationFrame(animationFrame);
    }, [inView, prefersReducedMotion, value]);

    return (
        <div ref={ref} className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
            <div className="font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                {displayValue}
                {suffix}
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-300">{label}</p>
        </div>
    );
}