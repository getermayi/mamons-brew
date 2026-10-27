"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowIcon, buttonVariants } from "@/components/ui/button";
import { Magnetic } from "@/components/motion/magnetic";
import { track } from "@/lib/track-client";
import { cn, waLink } from "@/lib/utils";
import { useSite } from "./site-context";

type Variant = "primary" | "red" | "ink" | "cream" | "outline" | "outline-light" | "ghost" | "tint";

/**
 * Renders a CMS link. The special href "whatsapp" opens a chat with the brand's number;
 * external links open in a new tab. Clicks on WhatsApp/phone/Instagram are tracked.
 */
export function SmartLink({ href, children, className, message, onClick }: { href: string; children: ReactNode; className?: string; message?: string; onClick?: () => void }) {
  const site = useSite();
  if (href === "whatsapp" || href.startsWith("https://wa.me")) {
    const url = href === "whatsapp" ? waLink(site.whatsapp, message ?? `Hi ${site.brandName}! 🍀`) : href;
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" className={className} onClick={() => { track("whatsapp_click", typeof children === "string" ? children : undefined); onClick?.(); }} data-cursor-label="Chat">
        {children}
      </a>
    );
  }
  if (href.startsWith("tel:")) return <a href={href} className={className} onClick={() => { track("phone_click"); onClick?.(); }}>{children}</a>;
  if (/^https?:\/\//.test(href)) {
    return <a href={href} target="_blank" rel="noopener noreferrer" className={className} onClick={() => { if (href.includes("instagram.com")) track("instagram_click"); onClick?.(); }}>{children}</a>;
  }
  return <Link href={href || "/"} className={className} onClick={onClick}>{children}</Link>;
}

export function CtaButton({ link, variant = "primary", size = "lg", magnetic = true, className, arrow = true }: { link: { label: string; href: string }; variant?: Variant; size?: "sm" | "md" | "lg"; magnetic?: boolean; className?: string; arrow?: boolean }) {
  if (!link.label || !link.href) return null;
  const isWa = link.href === "whatsapp";
  const btn = (
    <SmartLink href={link.href} className={cn(buttonVariants({ variant, size }), className)}>
      {isWa ? <WhatsAppIcon className="size-5" /> : null}
      {link.label}
      {arrow && !isWa ? <ArrowIcon /> : null}
    </SmartLink>
  );
  return magnetic ? <Magnetic>{btn}</Magnetic> : btn;
}

export function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden fill="currentColor">
      <path d="M12.04 2a9.9 9.9 0 0 0-8.5 14.98L2 22l5.16-1.5A9.9 9.9 0 1 0 12.04 2zm0 18.1a8.2 8.2 0 0 1-4.18-1.15l-.3-.18-3.06.89.9-2.98-.2-.31a8.2 8.2 0 1 1 6.84 3.73zm4.5-6.14c-.25-.12-1.46-.72-1.69-.8-.23-.08-.39-.12-.55.12-.16.25-.63.8-.78.96-.14.16-.29.18-.53.06-.25-.12-1.04-.38-1.98-1.22-.73-.65-1.23-1.46-1.37-1.7-.14-.25-.02-.38.11-.5.11-.11.25-.29.37-.43.12-.14.16-.25.25-.41.08-.16.04-.31-.02-.43-.06-.12-.55-1.33-.76-1.82-.2-.48-.4-.41-.55-.42h-.47c-.16 0-.43.06-.65.31-.23.25-.86.84-.86 2.04 0 1.2.88 2.36 1 2.52.12.16 1.73 2.64 4.19 3.7.59.25 1.04.4 1.4.52.59.19 1.12.16 1.55.1.47-.07 1.46-.6 1.66-1.17.21-.58.21-1.07.14-1.17-.06-.1-.22-.16-.47-.29z" />
    </svg>
  );
}
