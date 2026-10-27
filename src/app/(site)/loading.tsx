/** Branded loading state: a bottle filling up while the next page pours in. */
export default function Loading() {
  return (
    <div className="grid min-h-[70vh] place-items-center" role="status" aria-label="Loading">
      <div className="flex flex-col items-center gap-5">
        <svg viewBox="0 0 60 140" className="h-28 w-auto" aria-hidden>
          <defs>
            <clipPath id="ld-clip"><path d="M22 12h16v10c0 6 4 12 9 19 5 7 8 13 8 23v60c0 4-3 8-8 8H13c-5 0-8-4-8-8V64c0-10 3-16 8-23 5-7 9-13 9-19z" /></clipPath>
          </defs>
          <rect x="20" y="2" width="20" height="12" rx="3" fill="var(--ink)" />
          <path d="M22 12h16v10c0 6 4 12 9 19 5 7 8 13 8 23v60c0 4-3 8-8 8H13c-5 0-8-4-8-8V64c0-10 3-16 8-23 5-7 9-13 9-19z" fill="none" stroke="var(--ink)" strokeWidth="2" />
          <g clipPath="url(#ld-clip)">
            <rect x="0" y="0" width="60" height="140" fill="var(--brand-red)" className="origin-bottom animate-[fill_1.6s_ease-in-out_infinite]" style={{ transformBox: "fill-box" }} />
          </g>
        </svg>
        <p className="font-display text-xl italic text-muted">Pouring…</p>
      </div>
      <style>{`@keyframes fill{0%{transform:scaleY(0)}60%{transform:scaleY(1)}100%{transform:scaleY(1);opacity:0}}`}</style>
    </div>
  );
}
