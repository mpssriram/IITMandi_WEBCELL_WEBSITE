import { motion, useReducedMotion } from "framer-motion";
import type { PropsWithChildren } from "react";

type RevealProps = PropsWithChildren<{
    className?: string;
    delay?: number;
}>;

export function Reveal({ children, className, delay = 0 }: RevealProps) {
    const prefersReducedMotion = useReducedMotion();

    return (
        <motion.div
            className={className}
            initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 18 }}
            whileInView={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1], delay }}
        >
            {children}
        </motion.div>
    );
}