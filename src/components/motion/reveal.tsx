"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";
import { useMotionLevel } from "./motion-provider";

type Props = { children: ReactNode; delay?: number; y?: number; className?: string; as?: "div" | "li" | "section" | "article" };

/** Fade + rise when scrolled into view. Only opacity/transform are animated. */
export function Reveal({ children, delay = 0, y = 28, className, as = "div" }: Props) {
  const level = useMotionLevel();
  const Comp = motion[as];
  if (level === "off") {
    const Plain = as;
    return <Plain className={className}>{children}</Plain>;
  }
  return (
    <Comp
      className={className}
      initial={{ opacity: 0, y: level === "reduced" ? 0 : y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -12% 0px" }}
      transition={{ duration: level === "reduced" ? 0.4 : 0.9, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </Comp>
  );
}

/** Staggers its direct <RevealItem> children. */
export function Stagger({ children, className, gap = 0.08 }: { children: ReactNode; className?: string; gap?: number }) {
  const level = useMotionLevel();
  if (level === "off") return <div className={className}>{children}</div>;
  return (
    <motion.div className={className} initial="hidden" whileInView="show" viewport={{ once: true, margin: "0px 0px -10% 0px" }} variants={{ hidden: {}, show: { transition: { staggerChildren: gap } } }}>
      {children}
    </motion.div>
  );
}

export function RevealItem({ children, className }: { children: ReactNode; className?: string }) {
  const level = useMotionLevel();
  if (level === "off") return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      variants={{ hidden: { opacity: 0, y: level === "reduced" ? 0 : 32 }, show: { opacity: 1, y: 0, transition: { duration: 0.85, ease: [0.22, 1, 0.36, 1] } } }}
    >
      {children}
    </motion.div>
  );
}
