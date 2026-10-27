"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { HillsArt, LeafArt } from "@/components/brand/art";
import { Bottle } from "@/components/brand/bottle";
import { Fizz } from "@/components/motion/fizz";
import { useMotionLevel } from "@/components/motion/motion-provider";
import { SplitWords } from "@/components/motion/split-words";
import { CtaButton } from "@/components/site/smart-link";
import { MediaImage } from "@/components/ui/media-image";
import type { HeroContent } from "./definitions";

export function Hero({ c, flavour }: { c: HeroContent; flavour: { name: string; accent: string } }) {
  const ref = useRef<HTMLElement>(null);
  const level = useMotionLevel();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const on = level === "full";
  const sunY = useTransform(scrollYProgress, [0, 1], ["0%", on ? "35%" : "0%"]);
  const hillsBackY = useTransform(scrollYProgress, [0, 1], ["0%", on ? "18%" : "0%"]);
  const hillsFrontY = useTransform(scrollYProgress, [0, 1], ["0%", on ? "8%" : "0%"]);
  const bottleY = useTransform(scrollYProgress, [0, 1], ["0%", on ? "-22%" : "0%"]);
  const bottleRotate = useTransform(scrollYProgress, [0, 1], [-4, on ? 8 : -4]);
  const leafY = useTransform(scrollYProgress, [0, 1], ["0%", on ? "-60%" : "0%"]);
  const copyY = useTransform(scrollYProgress, [0, 1], ["0%", on ? "20%" : "0%"]);
  const copyOpacity = useTransform(scrollYProgress, [0, 0.7], [1, on ? 0 : 1]);

  return (
    <section ref={ref} className="relative isolate -mt-[72px] overflow-hidden pt-[72px] lg:-mt-[84px] lg:pt-[84px]">
      {/* background wash */}
      <div aria-hidden className="absolute inset-0 -z-20" style={{ background: `radial-gradient(120% 80% at 75% 30%, color-mix(in oklab, ${flavour.accent} 45%, var(--cream)) 0%, var(--cream) 60%)` }} />

      <div className="container-x grid min-h-[calc(100svh-72px)] items-center gap-6 pb-40 pt-8 lg:min-h-[calc(100svh-84px)] lg:grid-cols-12 lg:pb-48">
        <motion.div style={{ y: copyY, opacity: copyOpacity }} className="relative z-10 lg:col-span-7">
          {c.eyebrow ? (
            <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="inline-flex items-center gap-2 rounded-full border border-ink/15 bg-cream/60 px-4 py-2 text-eyebrow backdrop-blur">
              <span className="relative flex size-2"><span className="absolute inline-flex size-full animate-ping rounded-full bg-brand opacity-60" /><span className="relative inline-flex size-2 rounded-full bg-brand" /></span>
              {c.eyebrow}
            </motion.p>
          ) : null}
          <SplitWords text={c.headline} className="mt-6 text-mega" delay={0.15} />
          {c.subhead ? (
            <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.7, ease: [0.22, 1, 0.36, 1] }} className="mt-7 max-w-xl text-lead text-ink/75">
              {c.subhead}
            </motion.p>
          ) : null}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.85, ease: [0.22, 1, 0.36, 1] }} className="mt-9 flex flex-wrap items-center gap-3">
            <CtaButton link={c.primaryCta} variant="primary" />
            <CtaButton link={c.secondaryCta} variant="outline" />
          </motion.div>
          {c.badges.length ? (
            <motion.ul initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.1, duration: 1 }} className="mt-10 flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink/70">
              {c.badges.map((b) => (
                <li key={b.text} className="flex items-center gap-2"><span aria-hidden className="size-1.5 rounded-full bg-forest" />{b.text}</li>
              ))}
            </motion.ul>
          ) : null}
        </motion.div>

        {/* parallax stack: sun → hills → bottle → leaves */}
        <div className="relative h-[52vh] min-h-[340px] lg:col-span-5 lg:h-[78vh]" aria-hidden={!c.image.url}>
          <motion.div style={{ y: sunY, background: flavour.accent }} className="absolute left-1/2 top-[6%] aspect-square w-[78%] max-w-[520px] -translate-x-1/2 rounded-full opacity-90" />
          {c.image.url ? (
            <motion.div style={{ y: bottleY }} className="absolute inset-x-[6%] bottom-[4%] top-[2%] overflow-hidden rounded-[calc(var(--radius)*2)]">
              <MediaImage src={c.image.url} alt={c.image.alt} fill priority sizes="(min-width:1024px) 40vw, 90vw" className="object-cover" />
            </motion.div>
          ) : (
            <motion.div style={{ y: bottleY, rotate: bottleRotate }} className="absolute bottom-[2%] left-1/2 w-[38%] max-w-[230px] -translate-x-1/2">
              <motion.div animate={on ? { y: [0, -14, 0] } : undefined} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}>
                <Bottle color={flavour.accent} label={flavour.name} className="w-full drop-shadow-[0_40px_40px_rgba(20,22,19,0.25)]" />
              </motion.div>
            </motion.div>
          )}
          <Fizz color="rgba(245,239,227,0.9)" density={40} className="pointer-events-none absolute inset-0 size-full" />
          <motion.div style={{ y: leafY }} className="absolute -left-2 bottom-[18%] w-[34%] max-w-[200px] -rotate-12">
            <LeafArt color="#2E5240" />
          </motion.div>
          <motion.div style={{ y: leafY }} className="absolute -right-4 top-[22%] w-[24%] max-w-[150px] rotate-[150deg]">
            <LeafArt color="#8FA67C" />
          </motion.div>
        </div>
      </div>

      <motion.div style={{ y: hillsBackY }} className="pointer-events-none absolute inset-x-0 bottom-10 -z-10">
        <HillsArt className="h-[22vh] min-h-32" tones={["color-mix(in oklab, var(--sky) 70%, white)", "#B9C9A6"]} />
      </motion.div>
      <motion.div style={{ y: hillsFrontY }} className="pointer-events-none absolute inset-x-0 -bottom-1 z-0">
        <HillsArt className="h-[16vh] min-h-24" tones={["#8FA67C", "var(--forest)"]} />
      </motion.div>
    </section>
  );
}
