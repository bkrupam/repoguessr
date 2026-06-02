"use client";

import { useEffect, useRef, useState } from "react";

const CHARSET = "01{}[]();=<>/*&|^~#@$%abcdefghijklmnopqrstuvwxyz";

const COLS = 22;
const ROW_H = 14;
const CANVAS_W = 320;
const CANVAS_H = 176;

interface MatrixLoaderProps {
  label?: string;
}

export default function MatrixLoader({ label = "FETCHING SNIPPET" }: MatrixLoaderProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const onChange = () => setReducedMotion(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (reducedMotion) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = CANVAS_W * dpr;
    canvas.height = CANVAS_H * dpr;
    canvas.style.width = `${CANVAS_W}px`;
    canvas.style.height = `${CANVAS_H}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const colW = CANVAS_W / COLS;
    const drops = Array.from({ length: COLS }, () => Math.random() * -20);
    const speeds = Array.from({ length: COLS }, () => 0.35 + Math.random() * 0.85);

    let raf = 0;
    let running = true;

    function tick() {
      if (!running || !ctx) return;

      ctx.fillStyle = "rgba(5, 5, 5, 0.14)";
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

      ctx.textBaseline = "top";
      ctx.font = "11px 'JetBrains Mono', monospace";

      for (let i = 0; i < COLS; i++) {
        const x = i * colW + 2;
        const y = drops[i] * ROW_H;
        const trailLen = 4 + Math.floor(Math.random() * 3);

        for (let t = trailLen; t >= 0; t--) {
          const ty = y - t * ROW_H;
          if (ty < -ROW_H || ty > CANVAS_H) continue;

          const ch = CHARSET[Math.floor(Math.random() * CHARSET.length)];
          const isHead = t === 0;

          ctx.fillStyle = isHead ? "#FFFFFF" : "#9A9A9A";
          ctx.globalAlpha = isHead ? 1 : 0.12 + (1 - t / trailLen) * 0.45;
          ctx.fillText(ch, x, ty);
        }
        ctx.globalAlpha = 1;

        drops[i] += speeds[i];
        if (y > CANVAS_H + ROW_H * 3 && Math.random() > 0.96) {
          drops[i] = -Math.random() * 10;
        }
      }

      raf = requestAnimationFrame(tick);
    }

    ctx.fillStyle = "#050505";
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    raf = requestAnimationFrame(tick);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
    };
  }, [reducedMotion]);

  return (
    <div
      className="flex flex-col items-center gap-8"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      {reducedMotion ? (
        <StaticMatrixGrid />
      ) : (
        <canvas
          ref={canvasRef}
          className="rounded-lg border border-[#1a1a1a] bg-[#050505]"
          aria-hidden
        />
      )}

      <p className="label text-[#9A9A9A] tracking-[0.2em]">{label}</p>
      <span className="sr-only">Loading game snippet</span>
    </div>
  );
}

function StaticMatrixGrid() {
  const cells = Array.from({ length: COLS * 8 }, (_, i) =>
    CHARSET[i % CHARSET.length]
  );

  return (
    <div
      className="rounded-lg border border-[#1a1a1a] bg-[#050505] p-4 font-mono text-[11px] leading-[14px] text-[#9A9A9A] grid gap-0"
      style={{
        width: CANVAS_W,
        height: CANVAS_H,
        gridTemplateColumns: `repeat(${COLS}, 1fr)`,
      }}
      aria-hidden
    >
      {cells.map((c, i) => (
        <span key={i} className={i % 7 === 0 ? "text-white" : ""}>
          {c}
        </span>
      ))}
    </div>
  );
}
