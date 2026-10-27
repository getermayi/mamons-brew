import { BottleTrio, BubblesArt, CrateArt, HillsArt, JarArt, LeafArt } from "@/components/brand/art";
import { Counter } from "@/components/motion/counter";
import { Reveal, RevealItem, Stagger } from "@/components/motion/reveal";
import { SplitWords } from "@/components/motion/split-words";
import { CtaButton } from "@/components/site/smart-link";
import { MediaImage } from "@/components/ui/media-image";
import { AccentText } from "@/lib/accent";
import { cn } from "@/lib/utils";
import type {
  CtaContent, FeaturesContent, MarqueeContent, MythsContent, PageHeroContent, RichTextContent, StatementContent, StatsContent, TextImageContent, TimelineContent,
} from "./definitions";
import { BlockIcon } from "./icons";
import { MythCard } from "./interactive";
import { BrewTimeline } from "./brew-timeline";
import { Paragraphs, SectionHeading, isDark, toneClass } from "./shared";

function Art({ kind, className }: { kind: string; className?: string }) {
  switch (kind) {
    case "hills": return <HillsArt className={cn("h-full", className)} />;
    case "leaf": return <LeafArt className={className} />;
    case "bubbles": return <BubblesArt className={className} />;
    case "jar": return <JarArt className={className} />;
    case "crate": return <CrateArt className={className} />;
    case "bottles": return <BottleTrio className={className} />;
    default: return null;
  }
}

// ─── Page header ────────────────────────────────────────────────────

export function PageHeroBlock({ c }: { c: PageHeroContent }) {
  const dark = isDark(c.tone);
  return (
    <section className={cn("relative -mt-[72px] overflow-hidden pt-[72px] lg:-mt-[84px] lg:pt-[84px]", toneClass[c.tone])}>
      <div className="container-x grid gap-10 pb-16 pt-16 md:pb-24 md:pt-24 lg:grid-cols-12 lg:items-end">
        <div className="lg:col-span-8">
          {c.eyebrow ? <Reveal><p className={cn("text-eyebrow", dark ? "text-sky" : "text-brand")}>{c.eyebrow}</p></Reveal> : null}
          <SplitWords text={c.title} className="mt-5 text-display" />
          {c.intro ? <Reveal delay={0.35}><p className={cn("mt-7 max-w-2xl text-lead", dark ? "text-cream/80" : "text-ink/70")}>{c.intro}</p></Reveal> : null}
        </div>
        <div className="relative lg:col-span-4">
          {c.image.url ? (
            <Reveal delay={0.2} className="relative aspect-[4/5] overflow-hidden rounded-[calc(var(--radius)*1.5)]">
              <MediaImage src={c.image.url} alt={c.image.alt} fill priority sizes="(min-width:1024px) 30vw, 90vw" className="object-cover" />
            </Reveal>
          ) : c.art !== "none" && c.art !== "hills" ? (
            <Reveal delay={0.2} className="mx-auto w-2/3 max-w-xs lg:w-full">
              <Art kind={c.art} className={c.art === "bubbles" ? cn("w-full", dark ? "text-cream" : "text-forest") : "w-full"} />
            </Reveal>
          ) : null}
        </div>
      </div>
      {c.art === "hills" ? <HillsArt className="pointer-events-none -mb-px h-20 md:h-28" tones={dark ? ["color-mix(in oklab, var(--cream) 18%, transparent)", "var(--page-bg)"] : ["color-mix(in oklab, var(--sky) 55%, transparent)", "#B9C9A6"]} /> : null}
    </section>
  );
}

// ─── Marquee ────────────────────────────────────────────────────────

export function MarqueeBlock({ c }: { c: MarqueeContent }) {
  if (!c.items.length) return null;
  const row = [...c.items, ...c.items];
  return (
    <section aria-label={c.items.join(", ")} className={cn("relative overflow-hidden py-5 md:py-7", toneClass[c.tone])}>
      <div className="flex w-max animate-marquee items-center" aria-hidden>
        {[0, 1].map((k) => (
          <div key={k} className="flex shrink-0 items-center">
            {row.map((t, i) => (
              <span key={`${k}-${i}`} className="flex items-center whitespace-nowrap font-display text-[clamp(1.6rem,1rem+2.4vw,3.2rem)] italic">
                <span className="px-6 md:px-10">{t}</span>
                <svg viewBox="0 0 20 20" className="size-5 opacity-70"><circle cx="10" cy="10" r="7" fill="none" stroke="currentColor" strokeWidth="1.6" /><circle cx="14" cy="6" r="2" fill="currentColor" /></svg>
              </span>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── Features ───────────────────────────────────────────────────────

export function FeaturesBlock({ c }: { c: FeaturesContent }) {
  const dark = isDark(c.tone);
  return (
    <section className={cn("section-y", toneClass[c.tone])}>
      <div className="container-x">
        <SectionHeading eyebrow={c.eyebrow} title={c.title} intro={c.intro} align={c.layout === "list" ? "left" : "split"} />
        {c.layout === "bento" ? (
          <Stagger className="mt-14 grid auto-rows-[minmax(15rem,auto)] gap-4 md:grid-cols-6">
            {c.items.map((it, i) => {
              const span = ["md:col-span-4 md:row-span-2", "md:col-span-2", "md:col-span-2", "md:col-span-3", "md:col-span-3", "md:col-span-2", "md:col-span-4"][i % 7];
              const feature = i === 0;
              return (
                <RevealItem key={it.title} className={cn("group relative flex flex-col justify-between overflow-hidden rounded-[calc(var(--radius)*1.4)] p-7 md:p-9", span, feature ? "bg-forest text-cream" : i % 3 === 1 ? "bg-sky/60" : "bg-paper", "transition-transform duration-700 ease-[var(--ease-out)] hover:-translate-y-1")}>
                  <span className={cn("grid size-14 place-items-center rounded-full", feature ? "bg-cream/10 text-sky" : "bg-cream text-forest")}>
                    <BlockIcon name={it.icon} className="size-7" />
                  </span>
                  {feature ? <BubblesArt className="pointer-events-none absolute -right-6 -top-6 w-64 text-cream/30 transition-transform duration-[1.5s] group-hover:-translate-y-4" /> : null}
                  <div className="mt-10">
                    <h3 className={cn(feature ? "text-h2" : "text-h3")}>{it.title}</h3>
                    <p className={cn("mt-3 max-w-md", feature ? "text-lead text-cream/80" : "text-muted")}>{it.text}</p>
                  </div>
                </RevealItem>
              );
            })}
          </Stagger>
        ) : c.layout === "columns" ? (
          <Stagger className="mt-14 grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {c.items.map((it) => (
              <RevealItem key={it.title} className={cn("border-t pt-6", dark ? "border-cream/20" : "border-line")}>
                <BlockIcon name={it.icon} className={cn("size-8", dark ? "text-sky" : "text-brand")} />
                <h3 className="mt-5 text-h3">{it.title}</h3>
                <p className="mt-3 text-muted">{it.text}</p>
              </RevealItem>
            ))}
          </Stagger>
        ) : (
          <Stagger className="mt-12 divide-y divide-line border-y border-line">
            {c.items.map((it, i) => (
              <RevealItem key={it.title} className="grid gap-4 py-9 md:grid-cols-12 md:gap-8">
                <p className="text-eyebrow text-muted md:col-span-1 md:pt-3">{String(i + 1).padStart(2, "0")}</p>
                <h3 className="flex items-start gap-4 text-h3 md:col-span-4"><BlockIcon name={it.icon} className="mt-1 size-7 shrink-0 text-brand" />{it.title}</h3>
                <p className="text-lead text-muted md:col-span-7">{it.text}</p>
              </RevealItem>
            ))}
          </Stagger>
        )}
      </div>
    </section>
  );
}

// ─── Text + image ───────────────────────────────────────────────────

export function TextImageBlock({ c }: { c: TextImageContent }) {
  const left = c.imageSide === "left";
  const dark = isDark(c.tone);
  return (
    <section className={cn("section-y overflow-hidden", toneClass[c.tone])}>
      <div className="container-x grid items-center gap-12 lg:grid-cols-12 lg:gap-20">
        <div className={cn("lg:col-span-6", left ? "lg:order-2 lg:col-start-7" : "")}>
          {c.eyebrow ? <Reveal><p className={cn("text-eyebrow", dark ? "text-sky" : "text-brand")}>{c.eyebrow}</p></Reveal> : null}
          <SplitWords as="h2" onView text={c.title} className="mt-4 text-h2" />
          <Reveal delay={0.15}><Paragraphs text={c.body} className={cn("mt-7 text-lead", dark ? "text-cream/80" : "text-ink/75")} /></Reveal>
          {c.cta.label ? <Reveal delay={0.25} className="mt-9"><CtaButton link={c.cta} variant={dark ? "cream" : "outline"} size="md" /></Reveal> : null}
        </div>
        <Reveal y={60} className={cn("relative lg:col-span-6", left ? "lg:order-1" : "")}>
          <div className="relative aspect-[4/5] overflow-hidden rounded-[calc(var(--radius)*2)] bg-[color-mix(in_oklab,var(--sky)_40%,var(--cream))] sm:aspect-[5/5]">
            {c.image.url ? (
              <MediaImage src={c.image.url} alt={c.image.alt} fill sizes="(min-width:1024px) 45vw, 92vw" className="object-cover" />
            ) : c.art === "hills" ? (
              <>
                <div aria-hidden className="absolute right-[14%] top-[14%] size-[34%] rounded-full bg-[#F0A62E]" />
                <HillsArt className="absolute inset-x-0 bottom-0 h-[70%]" />
                <LeafArt className="absolute -left-4 top-[20%] w-1/3 -rotate-12" color="#2E5240" />
              </>
            ) : (
              <div className="absolute inset-0 grid place-items-center p-[14%]"><Art kind={c.art} className="w-full" /></div>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// ─── Timeline / steps ───────────────────────────────────────────────

export function TimelineBlock({ c }: { c: TimelineContent }) {
  if (c.style === "brew") {
    return (
      <section className="py-[clamp(4.5rem,3rem+6vw,8rem)] md:py-0">
        <BrewTimeline steps={c.steps} heading={<SectionHeading eyebrow={c.eyebrow} title={c.title} intro={c.intro} align="split" />} />
      </section>
    );
  }
  return (
    <section className="section-y">
      <div className="container-x">
        <SectionHeading eyebrow={c.eyebrow} title={c.title} intro={c.intro} align="split" />
        <Stagger className="mt-14 grid gap-4 md:grid-cols-3">
          {c.steps.map((s, i) => (
            <RevealItem key={s.title} className="relative flex min-h-72 flex-col overflow-hidden rounded-[calc(var(--radius)*1.4)] bg-paper p-8">
              <span aria-hidden className="font-display text-[7rem] leading-none text-ink/[0.07]">{i + 1}</span>
              <div className="mt-auto">
                {s.meta ? <p className="text-eyebrow text-brand">{s.meta}</p> : null}
                <h3 className="mt-3 text-h3">{s.title}</h3>
                <p className="mt-3 text-muted">{s.text}</p>
              </div>
            </RevealItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

// ─── Stats ──────────────────────────────────────────────────────────

export function StatsBlock({ c }: { c: StatsContent }) {
  return (
    <section className={cn("relative overflow-hidden py-20 md:py-28", toneClass[c.tone])}>
      <div className="container-x">
        {c.title ? <SplitWords as="h2" onView text={c.title} className="mb-12 max-w-2xl text-h2" /> : null}
        <Stagger className="grid grid-cols-2 gap-x-6 gap-y-12 lg:grid-cols-4">
          {c.items.map((s) => (
            <RevealItem key={s.label} className="border-l border-[var(--line)] pl-5">
              <p className="font-display text-[clamp(3.2rem,2rem+5vw,7rem)] leading-none tracking-tight">
                <Counter value={s.value} suffix={s.suffix} />
              </p>
              <p className="mt-3 max-w-[14rem] text-sm text-muted">{s.label}</p>
            </RevealItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

// ─── CTA ────────────────────────────────────────────────────────────

export function CtaBlock({ c }: { c: CtaContent }) {
  const dark = isDark(c.tone);
  return (
    <section className="container-x py-10 md:py-16">
      <Reveal y={50} className={cn("relative grid overflow-hidden rounded-[calc(var(--radius)*2)] lg:grid-cols-12", toneClass[c.tone], c.tone === "cream" && "bg-paper")}>
        <div className="relative z-10 p-8 sm:p-12 lg:col-span-7 lg:p-16">
          {c.eyebrow ? <p className={cn("text-eyebrow", dark ? "text-sky" : "text-brand")}>{c.eyebrow}</p> : null}
          <SplitWords as="h2" onView text={c.title} className="mt-4 text-h2" />
          {c.body ? <p className={cn("mt-5 max-w-lg text-lead", dark ? "text-cream/80" : "text-muted")}>{c.body}</p> : null}
          <div className="mt-9 flex flex-wrap gap-3">
            <CtaButton link={c.primary} variant={dark ? "cream" : "primary"} />
            <CtaButton link={c.secondary} variant={dark ? "outline-light" : "outline"} />
          </div>
        </div>
        {c.art !== "none" ? (
          <div aria-hidden className="relative min-h-64 lg:col-span-5">
            <BubblesArt className={cn("absolute right-6 top-6 w-40", dark ? "text-cream/40" : "text-forest/30")} />
            <div className="absolute inset-x-[12%] bottom-0 lg:inset-x-[8%]">
              <Art kind={c.art} className="w-full translate-y-[8%]" />
            </div>
          </div>
        ) : null}
      </Reveal>
    </section>
  );
}

// ─── Rich text / statement / myths ──────────────────────────────────

export function RichTextBlock({ c }: { c: RichTextContent }) {
  return (
    <section className="section-y pt-0 first:pt-[clamp(4.5rem,3rem+6vw,10rem)]">
      <div className={cn("container-x", c.width === "narrow" ? "max-w-3xl" : "max-w-5xl")}>
        <Reveal><div className="prose-brew" dangerouslySetInnerHTML={{ __html: c.content }} /></Reveal>
      </div>
    </section>
  );
}

export function StatementBlock({ c }: { c: StatementContent }) {
  return (
    <section className={cn("section-y relative overflow-hidden", toneClass[c.tone])}>
      <BubblesArt className={cn("pointer-events-none absolute -left-10 top-10 w-72", isDark(c.tone) ? "text-cream/20" : "text-forest/15")} />
      <div className="container-x relative text-center">
        <SplitWords as="p" onView text={c.text} className="mx-auto max-w-5xl font-display text-display" />
        {c.attribution ? <Reveal delay={0.4}><p className="mt-8 text-eyebrow opacity-70">— {c.attribution}</p></Reveal> : null}
      </div>
    </section>
  );
}

export function MythsBlock({ c }: { c: MythsContent }) {
  return (
    <section className="section-y">
      <div className="container-x">
        <SectionHeading eyebrow={c.eyebrow} title={c.title} intro="Tap a card to flip it." align="split" />
        <Stagger className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {c.items.map((m, i) => (
            <RevealItem key={m.myth}><MythCard myth={m.myth} fact={m.fact} index={i} /></RevealItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

export { AccentText };
