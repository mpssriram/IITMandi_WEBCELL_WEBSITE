import Hyperspeed from "@/components/Hyperspeed";

type LoginHyperspeedProps = {
    density?: number;
    className?: string;
};

const loginEffectOptions = {
    distortion: "turbulentDistortion",
    length: 420,
    roadWidth: 11,
    islandWidth: 2,
    lanesPerRoad: 3,
    fov: 92,
    fovSpeedUp: 140,
    speedUp: 1.6,
    carLightsFade: 0.38,
    totalSideLightSticks: 36,
    lightPairsPerRoadWay: 54,
    shoulderLinesWidthPercentage: 0.05,
    brokenLinesWidthPercentage: 0.08,
    brokenLinesLengthPercentage: 0.45,
    lightStickWidth: [0.12, 0.36],
    lightStickHeight: [1.1, 1.55],
    movingAwaySpeed: [48, 68],
    movingCloserSpeed: [-108, -148],
    carLightsLength: [420 * 0.03, 420 * 0.12],
    carLightsRadius: [0.04, 0.11],
    carWidthPercentage: [0.24, 0.42],
    carShiftX: [-0.4, 0.4],
    carFloorSeparation: [0.04, 0.8],
    colors: {
        roadColor: 0x050816,
        islandColor: 0x08101b,
        background: 0x020611,
        shoulderLines: 0x101c2a,
        brokenLines: 0x132233,
        leftCars: [0x7c3aed, 0x8b5cf6, 0xa855f7],
        rightCars: [0x22d3ee, 0x38bdf8, 0x2563eb],
        sticks: 0x67e8f9,
    },
};

export function LoginHyperspeed({ density = 36, className = "" }: LoginHyperspeedProps) {
    return <Hyperspeed density={density} effectOptions={loginEffectOptions} className={className} />;
}
