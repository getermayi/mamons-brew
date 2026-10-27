import { cn } from "@/lib/utils";

/**
 * The illustrated Mamon Brews bottle. Used wherever a product has no photo yet,
 * tinted with each flavour's accent so the line-up always reads as a family.
 */
export function Bottle({ color, label, className, title }: { color: string; label: string; className?: string; title?: string }) {
  const id = `b${label.replace(/[^a-z0-9]/gi, "")}${color.replace("#", "")}`;
  return (
    <svg viewBox="0 0 160 440" className={cn("h-auto", className)} role="img" aria-label={title ?? `${label} kombucha bottle`}>
      <defs>
        <linearGradient id={`${id}-glass`} x1="0" x2="1">
          <stop offset="0" stopColor="#2a1607" />
          <stop offset=".35" stopColor="#5a3311" />
          <stop offset=".7" stopColor="#3c210b" />
          <stop offset="1" stopColor="#1d0f05" />
        </linearGradient>
        <linearGradient id={`${id}-liquid`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor={color} stopOpacity=".95" />
          <stop offset="1" stopColor={color} stopOpacity=".55" />
        </linearGradient>
        <clipPath id={`${id}-clip`}>
          <path d="M56 40h48v20c0 12 9 26 22 44 14 19 22 36 22 62v238c0 13-10 23-23 23H35c-13 0-23-10-23-23V166c0-26 8-43 22-62 13-18 22-32 22-44z" />
        </clipPath>
      </defs>
      <ellipse cx="80" cy="430" rx="62" ry="8" fill="#000" opacity=".16" />
      <rect x="52" y="6" width="56" height="38" rx="6" fill="#141613" />
      <rect x="52" y="14" width="56" height="3" fill="#fff" opacity=".12" />
      <rect x="52" y="24" width="56" height="3" fill="#fff" opacity=".12" />
      <path d="M56 40h48v20c0 12 9 26 22 44 14 19 22 36 22 62v238c0 13-10 23-23 23H35c-13 0-23-10-23-23V166c0-26 8-43 22-62 13-18 22-32 22-44z" fill={`url(#${id}-glass)`} />
      <g clipPath={`url(#${id}-clip)`}>
        <rect x="0" y="150" width="160" height="290" fill={`url(#${id}-liquid)`} style={{ mixBlendMode: "screen" }} />
        <circle cx="40" cy="380" r="3" fill="#fff" opacity=".35" />
        <circle cx="118" cy="350" r="2.2" fill="#fff" opacity=".3" />
        <circle cx="64" cy="330" r="1.8" fill="#fff" opacity=".35" />
      </g>
      <rect x="18" y="206" width="124" height="136" rx="10" fill="#F5EFE3" />
      <rect x="18" y="206" width="124" height="136" rx="10" fill="none" stroke={color} strokeWidth="3" />
      <circle cx="80" cy="244" r="17" fill="#A8242C" />
      <path d="M80 227a17 17 0 0 1 0 34a8.5 8.5 0 0 0 0-17a8.5 8.5 0 0 1 0-17z" fill="#9CCBE4" />
      <text x="80" y="290" textAnchor="middle" fontFamily="var(--font-display), Georgia, serif" fontSize={label.length > 9 ? 15 : 19} fill="#141613">
        {label}
      </text>
      <text x="80" y="310" textAnchor="middle" fontFamily="var(--font-sans), Arial, sans-serif" fontSize="7.5" letterSpacing="2.6" fill="#141613" opacity=".7">
        MAMON BREWS
      </text>
      <rect x="44" y="322" width="72" height="3" rx="1.5" fill={color} />
      <path d="M30 150c-6 40-6 210 0 254" stroke="#fff" strokeWidth="6" strokeLinecap="round" opacity=".22" fill="none" />
      <path d="M128 170c3 30 3 120 0 160" stroke="#fff" strokeWidth="3" strokeLinecap="round" opacity=".12" fill="none" />
    </svg>
  );
}
