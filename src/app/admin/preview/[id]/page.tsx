import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Blocks } from "@/blocks/render";
import { SiteChrome } from "@/components/site/site-chrome";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/session";

export const metadata: Metadata = { title: "Preview", robots: { index: false } };

type Sec = { id: string; type: string; content: unknown; visible: boolean };

async function Preview({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const page = await db.page.findUnique({ where: { id }, include: { sections: { orderBy: { order: "asc" } } } });
  if (!page) notFound();
  const sections: Sec[] = Array.isArray(page.draft) ? (page.draft as unknown as Sec[]) : page.sections;
  return (
    <SiteChrome>
      <div className="pointer-events-none fixed bottom-4 left-1/2 z-[95] -translate-x-1/2 rounded-full bg-ink px-4 py-2 text-xs text-cream shadow-lg">Preview{Array.isArray(page.draft) ? " · unpublished draft" : ""}</div>
      <Blocks sections={sections.filter((s) => s.visible)} />
    </SiteChrome>
  );
}

/** Admin-only render of a page's draft, used by the page builder's live preview. */
export default function PreviewPage(props: PageProps<"/admin/preview/[id]">) {
  return (
    <Suspense fallback={null}>
      <Preview params={props.params} />
    </Suspense>
  );
}
