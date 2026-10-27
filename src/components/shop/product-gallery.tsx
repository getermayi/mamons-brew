"use client";

import { useState } from "react";
import { Lightbox } from "@/blocks/interactive";
import { Bottle } from "@/components/brand/bottle";
import { MediaImage } from "@/components/ui/media-image";
import { cn } from "@/lib/utils";

export function ProductGallery({ name, accent, images }: { name: string; accent: string; images: { url: string; alt: string }[] }) {
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState<number | null>(null);
  const items = images.map((i) => ({ ...i, width: 1200, height: 1500 }));
  const current = items[active];

  return (
    <div>
      <div className="relative aspect-[4/5] overflow-hidden rounded-[calc(var(--radius)*2)]" style={{ background: `color-mix(in oklab, ${accent} 60%, var(--cream))` }}>
        <span aria-hidden className="absolute left-1/2 top-[12%] aspect-square w-[74%] -translate-x-1/2 rounded-full" style={{ background: accent }} />
        {current ? (
          <button type="button" onClick={() => setOpen(active)} className="absolute inset-0" data-cursor-label="Zoom" aria-label={`Enlarge photo: ${current.alt}`}>
            <MediaImage src={current.url} alt={current.alt} fill priority sizes="(min-width:1024px) 50vw, 92vw" className="object-cover" />
          </button>
        ) : (
          <div className="absolute inset-x-0 bottom-[7%] mx-auto w-[36%]">
            <Bottle color={accent} label={name} className="w-full drop-shadow-[0_40px_40px_rgba(20,22,19,0.3)]" />
          </div>
        )}
      </div>
      {items.length > 1 ? (
        <ul className="mt-3 flex gap-3">
          {items.map((img, i) => (
            <li key={img.url}>
              <button type="button" onClick={() => setActive(i)} aria-pressed={active === i} aria-label={`Show photo ${i + 1}`} className={cn("relative block size-20 overflow-hidden rounded-xl ring-offset-2 transition", active === i ? "ring-2 ring-ink" : "opacity-70 hover:opacity-100")}>
                <MediaImage src={img.url} alt="" fill sizes="80px" className="object-cover" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      <Lightbox items={items} index={open} onIndex={setOpen} />
    </div>
  );
}
