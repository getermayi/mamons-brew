"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { Accordion, Dialog } from "radix-ui";
import { useEffect, useMemo, useState } from "react";
import { MediaImage } from "@/components/ui/media-image";
import { cn, formatDate } from "@/lib/utils";

// ─── Myth flip card ─────────────────────────────────────────────────

export function MythCard({ myth, fact, index }: { myth: string; fact: string; index: number }) {
  const [flipped, setFlipped] = useState(false);
  return (
    <button
      type="button"
      onClick={() => setFlipped((f) => !f)}
      aria-pressed={flipped}
      aria-label={flipped ? `Fact: ${fact}` : `Myth: ${myth}. Tap to see the fact.`}
      className="group relative block h-80 w-full text-left [perspective:1200px]"
      data-cursor-label={flipped ? "Back" : "Flip"}
    >
      <motion.span className="relative block size-full [transform-style:preserve-3d]" animate={{ rotateY: flipped ? 180 : 0 }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}>
        <span className="absolute inset-0 flex flex-col justify-between rounded-[calc(var(--radius)*1.4)] bg-paper p-8 [backface-visibility:hidden]">
          <span className="flex items-center justify-between text-eyebrow text-brand">Myth {String(index + 1).padStart(2, "0")}<span aria-hidden className="text-lg">↻</span></span>
          <span className="font-display text-[1.9rem] leading-tight">&ldquo;{myth}&rdquo;</span>
        </span>
        <span className="absolute inset-0 flex flex-col justify-between rounded-[calc(var(--radius)*1.4)] bg-forest p-8 text-cream [backface-visibility:hidden] [transform:rotateY(180deg)]">
          <span className="text-eyebrow text-sky">Fact</span>
          <span className="text-lg leading-relaxed">{fact}</span>
        </span>
      </motion.span>
    </button>
  );
}

// ─── FAQ ────────────────────────────────────────────────────────────

type FaqItem = { id: string; question: string; answer: string; category: string };

export function FaqList({ items, searchable }: { items: FaqItem[]; searchable: boolean }) {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");
  const categories = useMemo(() => ["All", ...Array.from(new Set(items.map((i) => i.category)))], [items]);
  const filtered = items.filter((i) => (cat === "All" || i.category === cat) && (!q || `${i.question} ${i.answer}`.toLowerCase().includes(q.toLowerCase())));

  return (
    <div>
      {searchable ? (
        <div className="mb-10 space-y-5">
          <label className="relative block">
            <span className="sr-only">Search questions</span>
            <svg viewBox="0 0 20 20" className="pointer-events-none absolute left-5 top-1/2 size-5 -translate-y-1/2 text-muted" aria-hidden><circle cx="9" cy="9" r="6" fill="none" stroke="currentColor" strokeWidth="1.6" /><path d="M14 14l4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
            <input value={q} onChange={(e) => setQ(e.target.value)} type="search" placeholder="Search — try “alcohol” or “delivery”" className="h-14 w-full rounded-full border border-line bg-paper pl-14 pr-5 text-base outline-none transition-shadow focus:shadow-[0_0_0_3px_var(--sky)]" />
          </label>
          <div role="group" aria-label="Categories" className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <button key={c} type="button" aria-pressed={cat === c} onClick={() => setCat(c)} className={cn("h-10 rounded-full border px-4 text-sm transition-colors", cat === c ? "border-ink bg-ink text-cream" : "border-line hover:border-ink/40")}>{c}</button>
            ))}
          </div>
        </div>
      ) : null}
      {filtered.length === 0 ? (
        <div className="rounded-[var(--radius)] border border-dashed border-line p-10 text-center">
          <p className="font-display text-2xl">No answer brewing for that one.</p>
          <p className="mt-2 text-muted">Ask us directly — <Link href="/contact" className="underline">we reply fast</Link>.</p>
        </div>
      ) : (
        <Accordion.Root type="single" collapsible className="divide-y divide-line border-y border-line">
          {filtered.map((f) => (
            <Accordion.Item key={f.id} value={f.id} className="group">
              <Accordion.Header>
                <Accordion.Trigger className="flex w-full items-center justify-between gap-6 py-6 text-left font-display text-[clamp(1.2rem,1rem+0.7vw,1.6rem)] leading-snug transition-colors hover:text-brand">
                  {f.question}
                  <span aria-hidden className="relative grid size-9 shrink-0 place-items-center rounded-full border border-line transition-colors group-data-[state=open]:bg-ink group-data-[state=open]:text-cream">
                    <span className="absolute h-px w-3.5 bg-current" />
                    <span className="absolute h-3.5 w-px bg-current transition-transform duration-300 group-data-[state=open]:rotate-90" />
                  </span>
                </Accordion.Trigger>
              </Accordion.Header>
              <Accordion.Content className="overflow-hidden data-[state=closed]:animate-[collapse_.3s_ease] data-[state=open]:animate-[expand_.35s_ease]">
                <p className="max-w-3xl pb-7 text-lead text-muted">{f.answer}</p>
              </Accordion.Content>
            </Accordion.Item>
          ))}
        </Accordion.Root>
      )}
    </div>
  );
}

// ─── Countdown ──────────────────────────────────────────────────────

export function Countdown({ to }: { to: string }) {
  const target = new Date(to).getTime();
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- start the clock only in the browser
    setNow(Date.now());
    const t = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(t);
  }, []);
  if (now === null) return <div className="h-[4.5rem]" aria-hidden />;
  const diff = Math.max(0, target - now);
  const parts = [["days", Math.floor(diff / 864e5)], ["hrs", Math.floor(diff / 36e5) % 24], ["min", Math.floor(diff / 6e4) % 60], ["sec", Math.floor(diff / 1e3) % 60]] as const;
  if (diff === 0) return <p className="font-display text-2xl">Happening now 🍀</p>;
  return (
    <div className="flex gap-2" role="timer" aria-label={`${parts[0][1]} days ${parts[1][1]} hours to go`}>
      {parts.map(([label, v]) => (
        <div key={label} className="min-w-16 rounded-2xl bg-ink/[0.06] px-3 py-2 text-center">
          <span className="block font-display text-3xl tabular-nums leading-none">{String(v).padStart(2, "0")}</span>
          <span className="text-[11px] uppercase tracking-wider text-muted">{label}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Gallery with lightbox ──────────────────────────────────────────

type GalleryImage = { id: string; url: string; alt: string; caption?: string | null; category: string; width: number; height: number };

export function MasonryGallery({ items, categories = true }: { items: GalleryImage[]; categories?: boolean }) {
  const cats = useMemo(() => ["All", ...Array.from(new Set(items.map((i) => i.category)))], [items]);
  const [cat, setCat] = useState("All");
  const [open, setOpen] = useState<number | null>(null);
  const shown = cat === "All" ? items : items.filter((i) => i.category === cat);

  return (
    <div>
      {categories && cats.length > 2 ? (
        <div role="group" aria-label="Filter photos" className="mb-8 flex flex-wrap gap-2">
          {cats.map((c) => (
            <button key={c} type="button" aria-pressed={cat === c} onClick={() => setCat(c)} className={cn("h-10 rounded-full border px-4 text-sm transition-colors", cat === c ? "border-ink bg-ink text-cream" : "border-line hover:border-ink/40")}>{c}</button>
          ))}
        </div>
      ) : null}
      <motion.ul layout className="columns-2 gap-3 md:columns-3 md:gap-4 xl:columns-4">
        {shown.map((g, i) => (
          <motion.li layout key={g.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: (i % 4) * 0.05 }} className="mb-3 break-inside-avoid md:mb-4">
            <button type="button" onClick={() => setOpen(i)} className="group relative block w-full overflow-hidden rounded-[var(--radius)]" data-cursor-label="Open">
              <MediaImage src={g.url} alt={g.alt} width={g.width} height={g.height} sizes="(min-width:1280px) 24vw, (min-width:768px) 32vw, 48vw" className="h-auto w-full transition-transform duration-700 ease-[var(--ease-out)] group-hover:scale-[1.04]" />
              <span className="absolute inset-x-0 bottom-0 translate-y-full bg-gradient-to-t from-ink/70 to-transparent p-4 text-left text-sm text-cream transition-transform duration-500 group-hover:translate-y-0">{g.caption || g.alt}</span>
            </button>
          </motion.li>
        ))}
      </motion.ul>
      <Lightbox items={shown} index={open} onIndex={setOpen} />
    </div>
  );
}

export function Lightbox({ items, index, onIndex }: { items: { url: string; alt: string; width: number; height: number; caption?: string | null }[]; index: number | null; onIndex: (i: number | null) => void }) {
  const go = (d: number) => index !== null && onIndex((index + d + items.length) % items.length);
  useEffect(() => {
    if (index === null) return;
    const k = (e: KeyboardEvent) => { if (e.key === "ArrowRight") go(1); if (e.key === "ArrowLeft") go(-1); };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  });
  const item = index !== null ? items[index] : null;

  return (
    <Dialog.Root open={index !== null} onOpenChange={(o) => !o && onIndex(null)}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[95] bg-ink/90 backdrop-blur-sm" />
        <Dialog.Content className="fixed inset-0 z-[96] flex flex-col items-center justify-center p-4 outline-none" aria-describedby={undefined}>
          <Dialog.Title className="sr-only">{item?.alt ?? "Photo"}</Dialog.Title>
          <AnimatePresence mode="wait">
            {item ? (
              <motion.div
                key={item.url}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.6}
                onDragEnd={(_, info) => { if (info.offset.x < -80) go(1); else if (info.offset.x > 80) go(-1); }}
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.35 }}
                className="relative max-h-[80vh] w-auto cursor-grab active:cursor-grabbing"
              >
                <MediaImage src={item.url} alt={item.alt} width={item.width} height={item.height} sizes="90vw" className="pointer-events-none max-h-[80vh] w-auto rounded-[var(--radius)] object-contain" draggable={false} />
              </motion.div>
            ) : null}
          </AnimatePresence>
          <p className="mt-4 max-w-xl text-center text-sm text-cream/80">{item?.caption || item?.alt} <span className="text-cream/50">· {(index ?? 0) + 1}/{items.length} · drag or use ← →</span></p>
          <div className="absolute inset-x-4 top-1/2 flex -translate-y-1/2 justify-between">
            <button type="button" onClick={() => go(-1)} className="grid size-12 place-items-center rounded-full bg-cream/10 text-cream hover:bg-cream/20" aria-label="Previous photo">←</button>
            <button type="button" onClick={() => go(1)} className="grid size-12 place-items-center rounded-full bg-cream/10 text-cream hover:bg-cream/20" aria-label="Next photo">→</button>
          </div>
          <Dialog.Close className="absolute right-5 top-5 grid size-12 place-items-center rounded-full bg-cream/10 text-cream hover:bg-cream/20" aria-label="Close">✕</Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export function EventGallery({ images }: { images: { url: string; alt: string }[] }) {
  const [open, setOpen] = useState<number | null>(null);
  const items = images.map((i) => ({ ...i, width: 1200, height: 1500 }));
  return (
    <>
      <ul className="flex gap-2">
        {items.map((g, i) => (
          <li key={g.url}>
            <button type="button" onClick={() => setOpen(i)} className="relative block size-20 overflow-hidden rounded-xl" aria-label={`Open photo: ${g.alt}`}>
              <MediaImage src={g.url} alt="" fill sizes="80px" className="object-cover transition-transform hover:scale-110" />
            </button>
          </li>
        ))}
      </ul>
      <Lightbox items={items} index={open} onIndex={setOpen} />
    </>
  );
}

// ─── Journal filter ─────────────────────────────────────────────────

type PostCard = { slug: string; title: string; excerpt: string; coverUrl: string | null; coverAlt: string | null; category: string | null; publishedAt: string | null; readingMinutes: number };

export function JournalGrid({ posts, categories }: { posts: PostCard[]; categories: string[] | null }) {
  const [cat, setCat] = useState("All");
  const shown = cat === "All" ? posts : posts.filter((p) => p.category === cat);
  return (
    <div>
      {categories && categories.length > 1 ? (
        <div role="group" aria-label="Categories" className="mb-10 flex flex-wrap gap-2">
          {["All", ...categories].map((c) => (
            <button key={c} type="button" aria-pressed={cat === c} onClick={() => setCat(c)} className={cn("h-10 rounded-full border px-4 text-sm transition-colors", cat === c ? "border-ink bg-ink text-cream" : "border-line hover:border-ink/40")}>{c}</button>
          ))}
        </div>
      ) : null}
      {shown.length === 0 ? (
        <p className="py-16 text-center font-display text-2xl text-muted">Still brewing a story for this one.</p>
      ) : (
        <ul className="grid gap-x-6 gap-y-14 md:grid-cols-2 lg:grid-cols-3">
          {shown.map((p, i) => (
            <motion.li key={p.slug} layout initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: (i % 3) * 0.06 }} className={cn(i === 0 && cat === "All" && "md:col-span-2 lg:col-span-2")}>
              <Link href={`/journal/${p.slug}`} className="group block" data-cursor-label="Read">
                <div className={cn("relative overflow-hidden rounded-[calc(var(--radius)*1.3)] bg-paper", i === 0 && cat === "All" ? "aspect-[16/9]" : "aspect-[4/3]")}>
                  {p.coverUrl ? <MediaImage src={p.coverUrl} alt={p.coverAlt ?? ""} fill sizes="(min-width:1024px) 60vw, 92vw" className="object-cover transition-transform duration-700 ease-[var(--ease-out)] group-hover:scale-[1.04]" /> : null}
                </div>
                <p className="mt-5 text-eyebrow text-muted">{[p.category, p.publishedAt ? formatDate(p.publishedAt) : null, `${p.readingMinutes} min read`].filter(Boolean).join(" · ")}</p>
                <h3 className="mt-3 text-h3 transition-colors group-hover:text-brand">{p.title}</h3>
                <p className="mt-3 max-w-xl text-muted">{p.excerpt}</p>
              </Link>
            </motion.li>
          ))}
        </ul>
      )}
    </div>
  );
}
