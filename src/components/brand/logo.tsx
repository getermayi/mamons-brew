import { cn } from "@/lib/utils";

/** The circular yin-yang swirl mark in the logo's deep red and light blue. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={cn("shrink-0", className)} aria-hidden>
      <circle cx="32" cy="32" r="30" fill="var(--cream)" stroke="currentColor" strokeWidth="2" />
      <circle cx="32" cy="32" r="20" fill="#A8242C" />
      <path d="M32 12a20 20 0 0 1 0 40a10 10 0 0 0 0-20a10 10 0 0 1 0-20z" fill="#9CCBE4" />
      <circle cx="32" cy="22" r="3" fill="#9CCBE4" />
      <circle cx="32" cy="42" r="3" fill="#A8242C" />
    </svg>
  );
}

export function Logo({ name = "Mamon Brews", src, className }: { name?: string; src?: string | null; className?: string }) {
  const custom = src && !src.startsWith("/brand/logo.svg");
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      {custom ? (
        // eslint-disable-next-line @next/next/no-img-element -- owner-uploaded logo of unknown dimensions
        <img src={src} alt="" className="h-9 w-auto" />
      ) : (
        <LogoMark className="size-9 transition-transform duration-700 ease-[var(--ease-fizz)] group-hover:rotate-180" />
      )}
      <span className="font-display text-[1.35rem] leading-none tracking-[-0.01em]">
        {name}
      </span>
    </span>
  );
}
