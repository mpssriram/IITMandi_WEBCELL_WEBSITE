import { useEffect, useRef } from "react";

import "./ClickSpark.css";

type ClickSparkProps = {
    sparkCount?: number;
    sparkSize?: number;
    sparkRadius?: number;
    disabled?: boolean;
};

function randomBetween(min: number, max: number) {
    return Math.random() * (max - min) + min;
}

export default function ClickSpark({
    sparkCount = 10,
    sparkSize = 8,
    sparkRadius = 22,
    disabled = false,
}: ClickSparkProps) {
    const layerRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (disabled) {
            return;
        }

        const layer = layerRef.current;
        if (!layer) {
            return;
        }

        const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

        const spawnSpark = (x: number, y: number) => {
            const spark = document.createElement("span");
            spark.className = "click-spark";
            spark.style.left = `${x}px`;
            spark.style.top = `${y}px`;
            spark.style.width = `${sparkSize}px`;
            spark.style.height = `${sparkSize}px`;

            const angle = randomBetween(0, Math.PI * 2);
            const distance = randomBetween(sparkRadius * 0.55, sparkRadius * 1.9);
            spark.style.setProperty("--spark-x", `${Math.cos(angle) * distance}px`);
            spark.style.setProperty("--spark-y", `${Math.sin(angle) * distance}px`);

            layer.appendChild(spark);
            spark.addEventListener(
                "animationend",
                () => {
                    spark.remove();
                },
                { once: true },
            );
        };

        const handlePointerDown = (event: PointerEvent) => {
            if (mediaQuery.matches) {
                return;
            }
            if (event.pointerType === "mouse" && event.button !== 0) {
                return;
            }

            for (let i = 0; i < sparkCount; i += 1) {
                spawnSpark(event.clientX, event.clientY);
            }
        };

        window.addEventListener("pointerdown", handlePointerDown);
        return () => {
            window.removeEventListener("pointerdown", handlePointerDown);
            layer.innerHTML = "";
        };
    }, [disabled, sparkCount, sparkRadius, sparkSize]);

    return <div ref={layerRef} className="click-spark-layer" aria-hidden="true" />;
}
