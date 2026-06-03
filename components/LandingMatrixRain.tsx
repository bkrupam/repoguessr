"use client";

import { useEffect, useRef, useState } from "react";

const CHARSET = "01{}[]();=<>/*&|^~#@$%abcdefghijklmnopqrstuvwxyz";
const ROW_H = 14;
const COL_STEP = 15;

function StaticMatrix({ width, height, cols }: { width: number; height: number; cols: number }) {
  const rows = Math.max(6, Math.floor(height / ROW_H));
  const cells = Array.from({ length: cols * rows }, (_, i) => CHARSET[i % CHARSET.length]);

  return (
    <div
      className="landing-matrix-static"
      style={{
        width,
        height,
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
      }}
      aria-hidden
    >
      {cells.map((c, i) => (
        <span key={i} className={i % 11 === 0 ? "text-white/70" : "text-[#9A9A9A]/55"}>
          {c}
        </span>
      ))}
    </div>
  );
}

export default function LandingMatrixRain() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [size, setSize] = useState({ w: 640, h: 220 });
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const onChange = () => setReducedMotion(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const measure = () => {
      const w = Math.floor(el.clientWidth);
      const h = Math.floor(el.clientHeight);
      setSize({ w: Math.max(320, w), h: Math.max(240, h) });
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (reducedMotion) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { w: CANVAS_W, h: CANVAS_H } = size;
    const COLS = Math.max(12, Math.floor(CANVAS_W / COL_STEP));

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = CANVAS_W * dpr;
    canvas.height = CANVAS_H * dpr;
    canvas.style.width = `${CANVAS_W}px`;
    canvas.style.height = `${CANVAS_H}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const colW = CANVAS_W / COLS;
    const drops = Array.from({ length: COLS }, () => Math.random() * -24);
    const speeds = Array.from({ length: COLS }, () => 0.4 + Math.random() * 0.9);

    let raf = 0;
    let running = true;

    function tick() {
      if (!running || !ctx) return;

      ctx.fillStyle = "rgba(0, 0, 0, 0.14)";
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

      ctx.textBaseline = "top";
      ctx.font = "12px 'JetBrains Mono', monospace";

      for (let i = 0; i < COLS; i++) {
        const x = i * colW + 1;
        const y = drops[i] * ROW_H;
        const trailLen = 5 + Math.floor(Math.random() * 4);

        for (let t = trailLen; t >= 0; t--) {
          const ty = y - t * ROW_H;
          if (ty < -ROW_H || ty > CANVAS_H) continue;

          const ch = CHARSET[Math.floor(Math.random() * CHARSET.length)];
          const isHead = t === 0;

          ctx.fillStyle = isHead ? "#FFFFFF" : "#9A9A9A";
          ctx.globalAlpha = isHead ? 0.72 : 0.06 + (1 - t / trailLen) * 0.32;
          ctx.fillText(ch, x, ty);
        }
        ctx.globalAlpha = 1;

        drops[i] += speeds[i];
        if (y > CANVAS_H + ROW_H * 4 && Math.random() > 0.94) {
          drops[i] = -Math.random() * 14;
        }
      }

      raf = requestAnimationFrame(tick);
    }

    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
    raf = requestAnimationFrame(tick);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
    };
  }, [reducedMotion, size]);

  const cols = Math.max(12, Math.floor(size.w / COL_STEP));

  return (
    <div ref={containerRef} className="landing-matrix-rain" aria-hidden>
      {reducedMotion ? (
        <StaticMatrix width={size.w} height={size.h} cols={cols} />
      ) : (
        <canvas ref={canvasRef} className="landing-matrix-canvas" />
      )}
    </div>
  );
}
