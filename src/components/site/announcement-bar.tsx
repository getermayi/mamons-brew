import Link from "next/link";
import type { Announcement } from "@/lib/schemas";

export function AnnouncementBar({ a }: { a: Announcement }) {
  if (!a.enabled || !a.text) return null;
  return (
    <div className="relative z-[51] text-center text-[0.82rem]" style={{ background: a.bg, color: a.fg }}>
      <p className="container-x flex min-h-10 items-center justify-center gap-2 py-2">
        <span aria-hidden className="inline-block size-1.5 animate-pulse rounded-full bg-current" />
        <span className="text-balance">{a.text}</span>
        {a.href && a.linkLabel ? (
          <Link href={a.href} className="hidden whitespace-nowrap font-semibold underline decoration-1 underline-offset-4 hover:no-underline sm:inline">
            {a.linkLabel} →
          </Link>
        ) : null}
      </p>
    </div>
  );
}
