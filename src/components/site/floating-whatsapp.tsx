"use client";

import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { SmartLink, WhatsAppIcon } from "./smart-link";

export function FloatingWhatsApp() {
  const { scrollY } = useScroll();
  const pathname = usePathname();
  const [show, setShow] = useState(false);
  useMotionValueEvent(scrollY, "change", (y) => setShow(y > 500));
  if (pathname.startsWith("/checkout")) return null;

  return (
    <AnimatePresence>
      {show ? (
        <motion.div className="fixed bottom-5 right-5 z-40 sm:bottom-7 sm:right-7" initial={{ scale: 0, rotate: -40 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}>
          <SmartLink href="whatsapp" className="group relative grid size-14 place-items-center rounded-full bg-[#1f8f4e] text-white shadow-lg shadow-ink/25 transition-transform hover:scale-105">
            <span className="absolute inset-0 animate-ping rounded-full bg-[#1f8f4e] opacity-20 [animation-duration:2.6s]" aria-hidden />
            <WhatsAppIcon className="relative size-7" />
            <span className="sr-only">Chat with us on WhatsApp</span>
          </SmartLink>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
