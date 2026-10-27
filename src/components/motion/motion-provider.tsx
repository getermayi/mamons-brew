"use client";

import { MotionConfig } from "motion/react";
import { createContext, use, useSyncExternalStore, type ReactNode } from "react";

export type MotionLevel = "full" | "reduced" | "off";

const MotionContext = createContext<MotionLevel>("full");

function subscribe(cb: () => void) {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}

/** Combines the admin "animations" setting with the visitor's OS preference. */
export function MotionProvider({ level, children }: { level: MotionLevel; children: ReactNode }) {
  const osReduced = useSyncExternalStore(subscribe, () => window.matchMedia("(prefers-reduced-motion: reduce)").matches, () => false);
  const effective: MotionLevel = level === "off" ? "off" : osReduced ? "off" : level;
  return (
    <MotionContext value={effective}>
      <MotionConfig reducedMotion={effective === "full" ? "never" : "always"}>{children}</MotionConfig>
    </MotionContext>
  );
}

export function useMotionLevel() {
  return use(MotionContext);
}
