"use client";

import { useEffect, useRef } from "react";

// Living fire behind the vitals while raging: a small WebGL plasma (domain-
// warped value noise tinted with the theme's rage red). Hand-written rather
// than the `shaders` library, which ships all its ~200 effects in one 727 kB
// (gzip) chunk. Without WebGL the canvas just stays empty.
// CombatVitals mounts it only while raging and never under reduced motion.

const VERT = `attribute vec2 p; void main() { gl_Position = vec4(p, 0.0, 1.0); }`;

const FRAG = `
precision mediump float;
uniform vec2 res;
uniform float t;
uniform vec3 cord;
float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
}
float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  for (int k = 0; k < 4; k++) { v += a * noise(p); p *= 2.03; a *= 0.5; }
  return v;
}
void main() {
  vec2 uv = gl_FragCoord.xy / res.y;
  // Flames rise: the field scrolls up and warps on itself.
  vec2 q = vec2(fbm(uv * 2.0 + vec2(0.0, -t * 0.35)), fbm(uv * 2.0 + vec2(5.2, -t * 0.3)));
  float f = fbm(uv * 2.4 + q * 1.6 + vec2(0.0, -t * 0.5));
  // Hotter towards the bottom edge of the card.
  float heat = smoothstep(0.35, 0.95, f) * (1.15 - gl_FragCoord.y / res.y * 0.6);
  vec3 col = mix(cord, vec3(1.0, 0.78, 0.45), smoothstep(0.75, 1.0, heat)) * heat;
  gl_FragColor = vec4(col, 1.0);
}`;

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.replace("#", ""), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

export function RageFlames() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const gl = canvas?.getContext("webgl", { antialias: false });
    if (!canvas || !gl) return;

    const shader = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, shader(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, shader(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
    gl.useProgram(prog);

    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const p = gl.getAttribLocation(prog, "p");
    gl.enableVertexAttribArray(p);
    gl.vertexAttribPointer(p, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(prog, "res");
    const uT = gl.getUniformLocation(prog, "t");
    // shortcut: the theme's red is read once per rage, so switching theme mid-rage keeps the old red.
    const cord = getComputedStyle(document.documentElement).getPropertyValue("--cord").trim() || "#c9463a";
    gl.uniform3fv(gl.getUniformLocation(prog, "cord"), hexToRgb(cord));

    // A soft glow needs no detail: render at half resolution and let CSS scale it.
    const resize = () => {
      canvas.width = Math.max(1, Math.round(canvas.clientWidth / 2));
      canvas.height = Math.max(1, Math.round(canvas.clientHeight / 2));
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(uRes, canvas.width, canvas.height);
    };
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    resize();

    let frame = 0;
    const start = performance.now();
    const draw = (now: number) => {
      gl.uniform1f(uT, (now - start) / 1000);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      frame = requestAnimationFrame(draw);
    };
    frame = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, []);

  return <canvas ref={ref} aria-hidden="true" className="rage-flames" />;
}
