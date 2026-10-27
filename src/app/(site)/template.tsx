"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";
import { useMotionLevel } from "@/components/motion/motion-provider";

/** Soft route transition: each page rises in as it mounts. */
export default function Template({ children }: { children: ReactNode }) {
  const level = useMotionLevel();
  if (level === "off") return <>{children}</>;
  return (
    <motion.div initial={{ opacity: 0, y: level === "full" ? 18 : 0 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}>
      {children}
    </motion.div>
  );
}
