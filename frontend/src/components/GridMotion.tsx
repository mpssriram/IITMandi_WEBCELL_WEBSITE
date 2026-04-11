import { useMemo, type ReactNode } from "react";

import ReactBitsGridMotion from "@/components/reactbits/GridMotion";

type GridMotionProps = {
    className?: string;
    items?: (string | ReactNode)[];
    gradientColor?: string;
};

export function GridMotion({ className = "", items, gradientColor = "rgba(34,211,238,0.22)" }: GridMotionProps) {
    const defaultItems = useMemo(
        () =>
            Array.from({ length: 28 }, (_, index) => (
                <div key={`g-item-${index}`} className="h-full w-full rounded-lg border border-cyan-300/10 bg-[linear-gradient(135deg,rgba(10,28,49,0.65),rgba(6,15,28,0.82))]" />
            )),
        [],
    );

    return (
        <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden>
            <ReactBitsGridMotion items={items?.length ? items : defaultItems} gradientColor={gradientColor} />
        </div>
    );
}

export default GridMotion;
