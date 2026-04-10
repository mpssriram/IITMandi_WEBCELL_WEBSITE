import type { Config } from "tailwindcss";

export default {
    content: ["./index.html", "./src/**/*.{ts,tsx}"],
    theme: {
        extend: {
            colors: {
                ink: {
                    950: "#050816",
                    900: "#0a1020",
                    800: "#111a32",
                },
                accent: {
                    50: "#ecfeff",
                    100: "#cffafe",
                    200: "#a5f3fc",
                    300: "#67e8f9",
                    400: "#22d3ee",
                    500: "#06b6d4",
                    600: "#0891b2",
                },
            },
            boxShadow: {
                glow: "0 0 0 1px rgba(34, 211, 238, 0.18), 0 24px 80px -24px rgba(34, 211, 238, 0.45)",
            },
            backgroundImage: {
                "club-grid":
                    "linear-gradient(rgba(148, 163, 184, 0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(148, 163, 184, 0.08) 1px, transparent 1px)",
            },
            fontFamily: {
                sans: ["'Plus Jakarta Sans'", "system-ui", "sans-serif"],
                display: ["'Space Grotesk'", "system-ui", "sans-serif"],
            },
            keyframes: {
                float: {
                    "0%, 100%": { transform: "translateY(0px)" },
                    "50%": { transform: "translateY(-10px)" },
                },
                shimmer: {
                    "0%": { transform: "translateX(-120%)" },
                    "100%": { transform: "translateX(120%)" },
                },
            },
            animation: {
                float: "float 7s ease-in-out infinite",
                shimmer: "shimmer 8s linear infinite",
            },
        },
    },
    plugins: [],
} satisfies Config;