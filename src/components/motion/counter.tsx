"use client";

import { animate, useInView } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { useMotionLevel } from "./motion-provider";

export function Counter({ value, suffix = "" }: { value: number; suffix?: string }) {
  const level = useMotionLevel();
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -15% 0px" });
  const [display, setDisplay] = useState(level === "full" ? 0 : value);

  useEffect(() => {
    if (!inView || level !== "full") return;
    const controls = animate(0, value, { duration: 1.8, ease: [0.22, 1, 0.36, 1], onUpdate: (v) => setDisplay(Math.round(v)) });
    return () => controls.stop();
  }, [inView, level, value]);

  return (
    <span ref={ref} className="tabular-nums">
      <span className="sr-only">{value}{suffix}</span>
      <span aria-hidden>
        {level === "full" ? display : value}
        {suffix}
      </span>
    </span>
  );
}
