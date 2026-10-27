"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useMotionLevel } from "./motion-provider";

/** Lenis smooth scrolling, synced with GSAP's ticker so ScrollTrigger stays in step. */
export function SmoothScroll() {
  const level = useMotionLevel();
  const pathname = usePathname();

  useEffect(() => {
    if (level !== "full" || window.matchMedia("(pointer: coarse)").matches) return;
    let cleanup = () => {};
    let cancelled = false;
    (async () => {
      const [{ default: Lenis }, { gsap }, { ScrollTrigger }] = await Promise.all([import("lenis"), import("gsap"), import("gsap/ScrollTrigger")]);
      if (cancelled) return;
      gsap.registerPlugin(ScrollTrigger);
      const lenis = new Lenis({ lerp: 0.11, wheelMultiplier: 0.95 });
      lenis.on("scroll", ScrollTrigger.update);
      const tick = (time: number) => lenis.raf(time * 1000);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);
      (window as Window & { __lenis?: { scrollTo: (t: number, o?: { immediate?: boolean }) => void } }).__lenis = lenis;
      cleanup = () => {
        gsap.ticker.remove(tick);
        lenis.destroy();
      };
    })();
    return () => {
      cancelled = true;
      cleanup();
    };
  }, [level]);

  useEffect(() => {
    const w = window as Window & { __lenis?: { scrollTo: (t: number, o?: { immediate?: boolean }) => void } };
    if (window.location.hash) return;
    if (w.__lenis) w.__lenis.scrollTo(0, { immediate: true });
    else window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
