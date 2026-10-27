"use client";

import { motion, useMotionValue, useSpring } from "motion/react";
import { useEffect, useState } from "react";
import { useMotionLevel } from "./motion-provider";

/** A soft bubble cursor on desktop. It swells over links and shows a label from data-cursor-label. */
export function Cursor() {
  const level = useMotionLevel();
  const [enabled, setEnabled] = useState(false);
  const [hover, setHover] = useState<string | null>(null);
  const [down, setDown] = useState(false);
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const sx = useSpring(x, { stiffness: 500, damping: 40, mass: 0.5 });
  const sy = useSpring(y, { stiffness: 500, damping: 40, mass: 0.5 });

  useEffect(() => {
    if (level !== "full") return;
    const mq = window.matchMedia("(pointer: fine) and (hover: hover)");
    if (!mq.matches) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- capability is only knowable in the browser
    setEnabled(true);
    document.documentElement.dataset.cursor = "custom";

    const move = (e: PointerEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      const el = (e.target as HTMLElement | null)?.closest<HTMLElement>("a, button, [role='button'], [data-cursor-label], label, summary, select");
      setHover(el ? (el.dataset.cursorLabel ?? "") : null);
    };
    const press = () => setDown(true);
    const release = () => setDown(false);
    const leave = () => { x.set(-100); y.set(-100); };
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerdown", press);
    window.addEventListener("pointerup", release);
    document.addEventListener("pointerleave", leave);
    return () => {
      delete document.documentElement.dataset.cursor;
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerdown", press);
      window.removeEventListener("pointerup", release);
      document.removeEventListener("pointerleave", leave);
    };
  }, [level, x, y]);

  if (!enabled) return null;
  const size = hover === null ? 14 : hover ? 84 : 44;

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[100] flex items-center justify-center rounded-full text-[11px] font-semibold uppercase tracking-[0.14em] text-cream mix-blend-difference"
      style={{ x: sx, y: sy, translateX: "-50%", translateY: "-50%" }}
      animate={{ width: size, height: size, scale: down ? 0.82 : 1, backgroundColor: hover === null ? "rgba(245,239,227,1)" : "rgba(245,239,227,0.95)" }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
    >
      {hover ? <span className="text-ink mix-blend-normal">{hover}</span> : null}
    </motion.div>
  );
}
