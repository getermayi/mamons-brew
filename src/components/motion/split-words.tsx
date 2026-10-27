"use client";

import { motion } from "motion/react";
import { Fragment } from "react";
import { parseAccent } from "@/lib/accent";
import { cn } from "@/lib/utils";
import { useMotionLevel } from "./motion-provider";

/** Headline that rises in word by word. `*word*` renders in the italic accent. */
export function SplitWords({ text, className, delay = 0, as = "h1", onView = false }: { text: string; className?: string; delay?: number; as?: "h1" | "h2" | "p"; onView?: boolean }) {
  const level = useMotionLevel();
  const Tag = as;
  const parts = parseAccent(text);
  const words = parts.flatMap((p, pi) => p.text.split(/(\s+)/).filter(Boolean).map((w, wi) => ({ w, accent: p.accent, key: `${pi}-${wi}` })));

  if (level !== "full") {
    return (
      <Tag className={className}>
        {parts.map((p, i) => (p.accent ? <em key={i} className="accent">{p.text}</em> : <Fragment key={i}>{p.text}</Fragment>))}
      </Tag>
    );
  }

  let index = 0;
  return (
    <Tag className={cn(className)} aria-label={text.replace(/\*/g, "")}>
      {words.map(({ w, accent, key }) => {
        if (/^\s+$/.test(w)) return <Fragment key={key}> </Fragment>;
        const i = index++;
        const inner = (
          <motion.span
            className="inline-block will-change-transform"
            initial={{ y: "105%", rotate: 4 }}
            {...(onView ? { whileInView: { y: "0%", rotate: 0 }, viewport: { once: true } } : { animate: { y: "0%", rotate: 0 } })}
            transition={{ duration: 1, delay: delay + i * 0.07, ease: [0.22, 1, 0.36, 1] }}
          >
            {accent ? <em className="accent">{w}</em> : w}
          </motion.span>
        );
        return (
          <span key={key} aria-hidden className="inline-block overflow-hidden pb-[0.12em] -mb-[0.12em] align-bottom">
            {inner}
          </span>
        );
      })}
    </Tag>
  );
}
