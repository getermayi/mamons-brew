"use client";

import { useState } from "react";

export function ShareButtons({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false);
  const links = [
    { label: "WhatsApp", href: `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}` },
    { label: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}` },
    { label: "X", href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}` },
  ];
  return (
    <div className="flex flex-wrap gap-2 lg:flex-col lg:items-start">
      <span className="sr-only">Share this article</span>
      {links.map((l) => (
        <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer" className="inline-flex h-10 items-center rounded-full border border-line px-4 text-sm transition-colors hover:bg-ink hover:text-cream">{l.label}</a>
      ))}
      <button
        type="button"
        className="inline-flex h-10 items-center rounded-full border border-line px-4 text-sm transition-colors hover:bg-ink hover:text-cream"
        onClick={async () => {
          if (navigator.share) {
            await navigator.share({ title, url }).catch(() => undefined);
            return;
          }
          await navigator.clipboard.writeText(url);
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1600);
        }}
      >
        {copied ? "Link copied" : "Copy link"}
      </button>
    </div>
  );
}
