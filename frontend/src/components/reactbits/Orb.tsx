import { useEffect, useRef } from "react";
import { Mesh, Program, Renderer, Triangle } from "ogl";

type OrbProps = {
    className?: string;
    intensity?: number;
};

const vertexShader = /* glsl */ `
    attribute vec2 uv;
    attribute vec2 position;

    varying vec2 vUv;

    void main() {
        vUv = uv;
        gl_Position = vec4(position, 0.0, 1.0);
    }
`;

const fragmentShader = /* glsl */ `
    precision highp float;

    uniform float uTime;
    uniform vec2 uResolution;
    uniform float uIntensity;

    varying vec2 vUv;

    mat2 rotate2D(float angle) {
        float s = sin(angle);
        float c = cos(angle);
        return mat2(c, -s, s, c);
    }

    float hash(vec2 p) {
        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
    }

    float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);

        float a = hash(i);
        float b = hash(i + vec2(1.0, 0.0));
        float c = hash(i + vec2(0.0, 1.0));
        float d = hash(i + vec2(1.0, 1.0));

        vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
    }

    float fbm(vec2 p) {
        float value = 0.0;
        float amplitude = 0.55;

        for (int i = 0; i < 5; i++) {
            value += amplitude * noise(p);
            p = rotate2D(0.65) * p * 2.05 + vec2(0.32, -0.28);
            amplitude *= 0.52;
        }

        return value;
    }

    void main() {
        vec2 uv = vUv * 2.0 - 1.0;
        uv.x *= uResolution.x / max(uResolution.y, 1.0);

        float radius = length(uv);
        vec2 field = uv * 1.28;
        float time = uTime * 0.33;

        field *= rotate2D(time * 0.55);

        float angle = atan(field.y, field.x);
        float flow = fbm(field * 2.6 + vec2(time * 0.55, -time * 0.32));
        float detail = fbm(field * 4.8 - vec2(time * 0.82, time * 0.45));
        float waves = sin(angle * 6.0 - time * 3.4 + flow * 3.2);
        float ring = smoothstep(0.92, 0.18, radius);
        float core = smoothstep(0.56, 0.02, radius);
        float rim = smoothstep(0.9, 0.54, radius) * (1.0 - smoothstep(0.54, 0.28, radius));

        float plasma = flow * 0.7 + detail * 0.4 + waves * 0.18;
        float pulse = 0.58 + 0.42 * sin(time * 2.3 - radius * 11.0 + plasma * 4.0);

        vec3 cyan = vec3(0.15, 0.9, 1.0);
        vec3 blue = vec3(0.2, 0.46, 1.0);
        vec3 violet = vec3(0.68, 0.36, 1.0);

        vec3 color = mix(cyan, violet, smoothstep(0.14, 0.92, plasma));
        color = mix(color, blue, 0.38 + 0.26 * sin(time * 1.7 + angle * 2.1));
        color += rim * vec3(0.12, 0.26, 0.52);
        color += pulse * 0.18 * cyan;

        float glow = exp(-3.1 * radius * radius) * (1.1 + 0.65 * plasma);
        float aura = exp(-7.2 * max(radius - 0.16, 0.0));
        color *= glow * 1.45;
        color += aura * vec3(0.05, 0.09, 0.16);
        color += core * vec3(0.07, 0.09, 0.12);

        float alpha = smoothstep(1.08, 0.18, radius) * (0.84 + 0.28 * pulse) * uIntensity;
        gl_FragColor = vec4(color, alpha);
    }
`;

export default function Orb({ className = "", intensity = 1 }: OrbProps) {
    const containerRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) {
            return;
        }

        const renderer = new Renderer({
            alpha: true,
            antialias: true,
            dpr: Math.min(window.devicePixelRatio || 1, 2),
        });

        const gl = renderer.gl;
        gl.clearColor(0, 0, 0, 0);

        const geometry = new Triangle(gl);
        const program = new Program(gl, {
            vertex: vertexShader,
            fragment: fragmentShader,
            uniforms: {
                uTime: { value: 0 },
                uResolution: { value: [1, 1] },
                uIntensity: { value: intensity },
            },
        });

        const mesh = new Mesh(gl, { geometry, program });
        let animationFrame = 0;

        const resize = () => {
            const width = Math.max(container.clientWidth, 1);
            const height = Math.max(container.clientHeight, 1);
            renderer.setSize(width, height);
            program.uniforms.uResolution.value = [width, height];
        };

        const render = (time: number) => {
            program.uniforms.uTime.value = time * 0.001;
            renderer.render({ scene: mesh });
            animationFrame = window.requestAnimationFrame(render);
        };

        resize();
        container.appendChild(gl.canvas);
        gl.canvas.style.width = "100%";
        gl.canvas.style.height = "100%";
        gl.canvas.style.display = "block";
        gl.canvas.setAttribute("aria-hidden", "true");

        const resizeObserver = new ResizeObserver(resize);
        resizeObserver.observe(container);

        animationFrame = window.requestAnimationFrame(render);

        return () => {
            window.cancelAnimationFrame(animationFrame);
            resizeObserver.disconnect();
            if (gl.canvas.parentElement === container) {
                container.removeChild(gl.canvas);
            }
            gl.getExtension("WEBGL_lose_context")?.loseContext();
        };
    }, [intensity]);

    return <div ref={containerRef} className={`h-full w-full ${className}`.trim()} />;
}
