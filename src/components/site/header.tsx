"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { useEffect, useState } from "react";
import { Logo } from "@/components/brand/logo";
import { useCart } from "@/components/cart/cart-store";
import type { NavTree } from "@/lib/data";
import { cn } from "@/lib/utils";
import { MobileMenu } from "./mobile-menu";
import { SmartLink, WhatsAppIcon } from "./smart-link";

export function Header({ nav, brandName, logoUrl }: { nav: NavTree; brandName: string; logoUrl: string | null }) {
  const pathname = usePathname();
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    setScrolled(y > 24);
    setHidden(y > 160 && y > prev + 2 && !menuOpen);
    if (y < prev - 2) setHidden(false);
  });

  // eslint-disable-next-line react-hooks/set-state-in-effect -- close the menu on navigation
  useEffect(() => setMenuOpen(false), [pathname]);

  return (
    <>
      <motion.header
        className="sticky top-0 z-50"
        animate={{ y: hidden ? "-110%" : "0%" }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className={cn("transition-[background-color,box-shadow,backdrop-filter] duration-500", scrolled || menuOpen ? "bg-[color-mix(in_oklab,var(--page-bg)_82%,transparent)] shadow-[0_1px_0_var(--line)] backdrop-blur-xl" : "bg-transparent")}>
          <div className="container-x flex h-[72px] items-center justify-between gap-6 lg:h-[84px]">
            <Link href="/" className="group relative z-[61] text-ink" aria-label={`${brandName} — home`}>
              <Logo name={brandName} src={logoUrl} />
            </Link>

            <nav aria-label="Main" className="hidden xl:block">
              <ul className="flex items-center gap-1">
                {nav.map((item) => {
                  const active = pathname === item.href || item.children.some((c) => pathname === c.href);
                  return (
                    <li key={item.id} className="group/nav relative">
                      <Link href={item.href} className={cn("relative inline-flex h-11 items-center whitespace-nowrap rounded-full px-3.5 text-[0.95rem] transition-colors hover:bg-ink/5", active && "text-brand")} aria-current={pathname === item.href ? "page" : undefined}>
                        {item.label}
                        {item.children.length ? <svg viewBox="0 0 12 12" className="ml-1 size-3 transition-transform group-hover/nav:rotate-180" aria-hidden><path d="M3 4.5l3 3 3-3" stroke="currentColor" fill="none" strokeWidth="1.5" /></svg> : null}
                      </Link>
                      {item.children.length ? (
                        <div className="invisible absolute left-1/2 top-full w-64 -translate-x-1/2 translate-y-2 pt-2 opacity-0 transition-all duration-300 group-hover/nav:visible group-hover/nav:translate-y-0 group-hover/nav:opacity-100 group-focus-within/nav:visible group-focus-within/nav:translate-y-0 group-focus-within/nav:opacity-100">
                          <ul className="rounded-[var(--radius)] border border-line bg-paper p-2 shadow-xl shadow-ink/5">
                            {item.children.map((c) => (
                              <li key={c.id}>
                                <Link href={c.href} className="flex items-center justify-between rounded-xl px-4 py-3 text-[0.95rem] transition-colors hover:bg-ink/5">
                                  {c.label}
                                  <span aria-hidden className="text-muted">→</span>
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            </nav>

            <div className="relative z-[61] flex items-center gap-2">
              <SmartLink href="whatsapp" className="hidden h-11 items-center gap-2 whitespace-nowrap rounded-full bg-forest px-5 text-sm font-medium text-cream transition-colors hover:bg-brand md:inline-flex">
                <WhatsAppIcon className="size-4" /> Order on WhatsApp
              </SmartLink>
              <CartButton />
              <button
                type="button"
                className="grid size-11 place-items-center rounded-full border border-line bg-cream/60 xl:hidden"
                aria-expanded={menuOpen}
                aria-controls="mobile-menu"
                aria-label={menuOpen ? "Close menu" : "Open menu"}
                onClick={() => setMenuOpen((o) => !o)}
              >
                <span className="relative block h-3 w-5" aria-hidden>
                  <span className={cn("absolute left-0 top-0 h-[1.5px] w-full bg-current transition-transform duration-500", menuOpen && "translate-y-[5.5px] rotate-45")} />
                  <span className={cn("absolute bottom-0 left-0 h-[1.5px] w-full bg-current transition-transform duration-500", menuOpen && "-translate-y-[5.5px] -rotate-45")} />
                </span>
              </button>
            </div>
          </div>
        </div>
      </motion.header>
      <AnimatePresence>{menuOpen ? <MobileMenu nav={nav} onClose={() => setMenuOpen(false)} /> : null}</AnimatePresence>
    </>
  );
}

function CartButton() {
  const { count, setOpen, pulse, ready } = useCart();
  return (
    <button type="button" onClick={() => setOpen(true)} className="relative grid size-11 place-items-center rounded-full border border-line bg-cream/60 transition-colors hover:bg-ink hover:text-cream" aria-label={`Open cart, ${count} items`}>
      <svg viewBox="0 0 24 24" className="size-5" aria-hidden><path d="M6 8h12l-1 12H7L6 8zm3 0V6a3 3 0 0 1 6 0v2" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /></svg>
      <AnimatePresence>
        {ready && count > 0 ? (
          <motion.span
            key={pulse}
            initial={{ scale: 0.4 }}
            animate={{ scale: [1.5, 0.9, 1] }}
            exit={{ scale: 0 }}
            transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
            className="absolute -right-1 -top-1 grid min-w-5 place-items-center rounded-full bg-brand px-1.5 text-[11px] font-semibold leading-5 text-cream tabular-nums"
          >
            {count}
          </motion.span>
        ) : null}
      </AnimatePresence>
    </button>
  );
}
