"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { useEffect } from "react";
import { HillsArt } from "@/components/brand/art";
import type { NavTree } from "@/lib/data";
import { SmartLink, WhatsAppIcon } from "./smart-link";
import { useSite } from "./site-context";

export function MobileMenu({ nav, onClose }: { nav: NavTree; onClose: () => void }) {
  const site = useSite();

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const links = nav.flatMap((i) => (i.children.length ? i.children : [i]));

  return (
    <motion.div
      id="mobile-menu"
      role="dialog"
      aria-modal="true"
      aria-label="Menu"
      data-lenis-prevent
      className="fixed inset-0 z-[49] flex flex-col overflow-y-auto bg-forest text-cream xl:hidden"
      initial={{ clipPath: "circle(0% at calc(100% - 2.5rem) 2.25rem)" }}
      animate={{ clipPath: "circle(150% at calc(100% - 2.5rem) 2.25rem)" }}
      exit={{ clipPath: "circle(0% at calc(100% - 2.5rem) 2.25rem)" }}
      transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
    >
      <nav aria-label="Mobile" className="container-x flex-1 pb-8 pt-28">
        <ul className="space-y-1">
          {links.map((l, i) => (
            <motion.li key={l.id} initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.18 + i * 0.04, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}>
              <Link href={l.href} onClick={onClose} className="group flex items-baseline gap-4 py-1.5 font-display text-[2.35rem] leading-[1.05] tracking-tight">
                <span className="w-7 text-xs font-sans tabular-nums text-cream/50">{String(i + 1).padStart(2, "0")}</span>
                <span className="transition-transform duration-500 group-active:translate-x-2">{l.label}</span>
              </Link>
            </motion.li>
          ))}
        </ul>
      </nav>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="container-x space-y-3 pb-10">
        <SmartLink href="whatsapp" onClick={onClose} className="flex h-14 w-full items-center justify-center gap-2 rounded-full bg-cream text-base font-medium text-ink">
          <WhatsAppIcon className="size-5" /> Order on WhatsApp
        </SmartLink>
        <div className="flex justify-between text-sm text-cream/75">
          <a href={`tel:${site.phone.replace(/\s/g, "")}`}>{site.phone}</a>
          {site.instagram ? <a href={site.instagram} target="_blank" rel="noopener noreferrer">Instagram ↗</a> : null}
        </div>
      </motion.div>
      <HillsArt className="pointer-events-none h-24 opacity-30" tones={["#2E5240", "#8FA67C"]} />
    </motion.div>
  );
}
