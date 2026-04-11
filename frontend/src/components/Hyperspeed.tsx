import { useMemo } from "react";

import ReactBitsHyperspeed from "@/components/reactbits/Hyperspeed";
import { hyperspeedPresets } from "@/components/reactbits/HyperSpeedPresets";

type BaseOptions = typeof hyperspeedPresets.one;

type HyperspeedProps = {
    effectOptions?: Partial<BaseOptions>;
    className?: string;
    density?: number;
};

export function Hyperspeed({ effectOptions = {}, className = "", density }: HyperspeedProps) {
    const mergedOptions = useMemo(() => {
        const base = hyperspeedPresets.one;
        const sticks = density ?? effectOptions.totalSideLightSticks ?? base.totalSideLightSticks;
        const pairs = density ? Math.max(24, density * 2) : (effectOptions.lightPairsPerRoadWay ?? base.lightPairsPerRoadWay);

        return {
            ...base,
            ...effectOptions,
            totalSideLightSticks: sticks,
            lightPairsPerRoadWay: pairs,
            colors: {
                ...base.colors,
                ...(effectOptions.colors || {}),
            },
        };
    }, [density, effectOptions]);

    return (
        <div className={`absolute inset-0 pointer-events-none ${className}`.trim()} aria-hidden="true">
            <ReactBitsHyperspeed effectOptions={mergedOptions} />
        </div>
    );
}

export default Hyperspeed;

