"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useMotionLevel } from "@/components/motion/motion-provider";
import { cn } from "@/lib/utils";

type Step = { title: string; text: string; meta: string };

const glyphs = [
  // tea, scoby, ferment, flavour, second ferment, bottle
  <path key="0" d="M8 14h20v6a10 10 0 0 1-20 0zM28 16h3a3 3 0 0 1 0 6h-3M14 6c0 2 2 2 2 4M20 6c0 2 2 2 2 4" />,
  <g key="1"><ellipse cx="18" cy="18" rx="12" ry="5" /><path d="M8 18c2 4 18 4 20 0" /><circle cx="14" cy="17" r="1" /><circle cx="21" cy="19" r="1" /></g>,
  <g key="2"><path d="M11 6h14v4l4 6v12a3 3 0 0 1-3 3H10a3 3 0 0 1-3-3V16l4-6z" /><circle cx="14" cy="22" r="1.5" /><circle cx="20" cy="18" r="1" /><circle cx="22" cy="25" r="1.2" /></g>,
  <g key="3"><path d="M6 28C14 10 26 6 32 8 26 22 16 30 6 28z" /><path d="M6 28C16 22 24 15 32 8" /></g>,
  <g key="4"><circle cx="12" cy="22" r="3" /><circle cx="22" cy="14" r="4" /><circle cx="24" cy="26" r="2" /><circle cx="14" cy="10" r="1.6" /></g>,
  <g key="5"><path d="M15 4h6v4c0 2 2 4 4 7 1 2 2 4 2 7v8a2 2 0 0 1-2 2H11a2 2 0 0 1-2-2v-8c0-3 1-5 2-7 2-3 4-5 4-7z" /><path d="M12 20h12" /></g>,
];

/** "How it's brewed": a pinned, horizontally progressing timeline driven by GSAP ScrollTrigger. */
export function BrewTimeline({ steps, heading }: { steps: Step[]; heading?: ReactNode }) {
  const level = useMotionLevel();
  const section = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLOListElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(level === "full" ? 0 : steps.length - 1);

  useEffect(() => {
    if (level !== "full" || !section.current || !track.current || !bar.current) return;
    let ctx: { revert: () => void } | null = null;
    let cancelled = false;
    (async () => {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([import("gsap"), import("gsap/ScrollTrigger")]);
      if (cancelled || !section.current || !track.current || !bar.current) return;
      gsap.registerPlugin(ScrollTrigger);
      const mm = gsap.matchMedia();
      mm.add("(min-width: 768px)", () => {
        const distance = () => Math.max(0, track.current!.scrollWidth - section.current!.clientWidth + 48);
        gsap.to(track.current, {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: {
            trigger: section.current,
            start: "top top",
            end: () => `+=${distance() + window.innerHeight * 0.6}`,
            pin: true,
            scrub: 0.6,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              bar.current!.style.transform = `scaleX(${self.progress})`;
              setActive(Math.min(steps.length - 1, Math.floor(self.progress * steps.length * 0.999)));
            },
          },
        });
      });
      mm.add("(max-width: 767px)", () => {
        ScrollTrigger.create({
          trigger: track.current,
          start: "top 70%",
          end: "bottom 60%",
          scrub: true,
          onUpdate: (self) => {
            bar.current!.style.transform = `scaleY(${self.progress})`;
            setActive(Math.min(steps.length - 1, Math.floor(self.progress * steps.length * 0.999)));
          },
        });
      });
      ctx = mm;
    })();
    return () => {
      cancelled = true;
      ctx?.revert();
    };
  }, [level, steps.length]);

  return (
    <div ref={section} className="relative md:flex md:min-h-[100svh] md:flex-col md:justify-center md:overflow-hidden">
      {heading ? <div className="container-x mb-14 md:mb-16">{heading}</div> : null}
      <div className="container-x">
       <div className="relative">
        <div aria-hidden className="absolute left-[27px] top-0 h-full w-px bg-line md:left-0 md:top-[27px] md:h-px md:w-full">
          <div ref={bar} className={cn("absolute inset-0 origin-top bg-brand md:origin-left", level !== "full" && "scale-100")} style={level === "full" ? { transform: "scale(0)" } : undefined} />
        </div>
        <ol ref={track} className="relative flex flex-col gap-10 md:w-max md:flex-row md:gap-0 md:pr-[10vw]">
          {steps.map((s, i) => {
            const on = i <= active;
            return (
              <li key={s.title} className="relative grid grid-cols-[56px_1fr] gap-5 md:block md:w-[min(30rem,38vw)] md:pr-14">
                <span aria-hidden className={cn("relative z-10 grid size-14 place-items-center rounded-full border transition-[background-color,color,border-color,transform] duration-500", on ? "scale-100 border-brand bg-brand text-cream" : "scale-90 border-line bg-cream text-ink/50")}>
                  <svg viewBox="0 0 36 36" className="size-7" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">{glyphs[i % glyphs.length]}</svg>
                </span>
                <div className={cn("transition-opacity duration-500 md:mt-8", on ? "opacity-100" : "opacity-45")}>
                  <p className="text-eyebrow text-muted">Step {i + 1}{s.meta ? ` · ${s.meta}` : ""}</p>
                  <h3 className="mt-3 text-h3">{s.title}</h3>
                  <p className="mt-3 max-w-sm text-muted">{s.text}</p>
                </div>
              </li>
            );
          })}
        </ol>
       </div>
      </div>
    </div>
  );
}
