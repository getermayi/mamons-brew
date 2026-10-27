"use client";

import { useEffect, useRef } from "react";
import { useMotionLevel } from "./motion-provider";

/** Rising bubbles on a canvas. Pauses off-screen and when the tab is hidden; capped particle count. */
export function Fizz({ color = "rgba(245,239,227,0.75)", density = 46, className }: { color?: string; density?: number; className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const level = useMotionLevel();

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || level === "off") return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const count = level === "reduced" ? 0 : Math.round(density * (window.innerWidth < 768 ? 0.5 : 1));
    if (!count) return;

    let w = 0, h = 0, raf = 0, visible = true;
    const dpr = Math.min(window.devicePixelRatio, 2);
    type B = { x: number; y: number; r: number; v: number; wob: number; ph: number };
    let bubbles: B[] = [];
    const spawn = (anywhere: boolean): B => ({ x: Math.random() * w, y: anywhere ? Math.random() * h : h + 10, r: 1 + Math.random() * 4.5, v: 0.25 + Math.random() * 0.9, wob: 0.3 + Math.random() * 0.9, ph: Math.random() * Math.PI * 2 });

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      w = rect.width; h = rect.height;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      bubbles = Array.from({ length: count }, () => spawn(true));
    };
    const draw = (t: number) => {
      ctx.clearRect(0, 0, w, h);
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.2;
      for (const b of bubbles) {
        b.y -= b.v;
        const x = b.x + Math.sin(t / 900 + b.ph) * b.wob * 6;
        if (b.y < -10) Object.assign(b, spawn(false));
        ctx.globalAlpha = Math.min(1, b.y / (h * 0.35));
        ctx.beginPath();
        ctx.arc(x, b.y, b.r, 0, Math.PI * 2);
        ctx.stroke();
      }
      raf = visible ? requestAnimationFrame(draw) : 0;
    };

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting && !document.hidden;
      if (visible && !raf) raf = requestAnimationFrame(draw);
    });
    resize();
    io.observe(canvas);
    window.addEventListener("resize", resize);
    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("resize", resize);
    };
  }, [color, density, level]);

  return <canvas ref={ref} aria-hidden className={className ?? "pointer-events-none absolute inset-0 size-full"} />;
}
