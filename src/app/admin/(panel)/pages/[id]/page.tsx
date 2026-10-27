import { notFound } from "next/navigation";
import type { DraftSection } from "@/app/admin/actions/pages";
import { PageHeader } from "@/components/admin/ui";
import { db } from "@/lib/db";
import { can, requireAdmin } from "@/lib/session";
import { PageBuilder } from "./page-builder";

export default async function EditPage({ params }: PageProps<"/admin/pages/[id]">) {
  const { id } = await params;
  const user = await requireAdmin();
  const page = await db.page.findUnique({ where: { id }, include: { sections: { orderBy: { order: "asc" } } } });
  if (!page) notFound();

  const live: DraftSection[] = page.sections.map((s) => ({ id: s.id, type: s.type, content: (s.content ?? {}) as Record<string, unknown>, visible: s.visible }));
  const draft = Array.isArray(page.draft) ? (page.draft as unknown as DraftSection[]) : null;

  return (
    <>
      <PageHeader back={{ href: "/admin/pages", label: "Pages" }} title={page.title} description={`mamonbrews.in/${page.slug === "home" ? "" : page.slug}`} />
      <PageBuilder
        page={{ id: page.id, slug: page.slug, system: page.system, title: page.title, status: page.status, seoTitle: page.seoTitle ?? "", seoDescription: page.seoDescription ?? "", ogImageUrl: page.ogImageUrl ?? "", noindex: page.noindex }}
        sections={draft ?? live}
        hasDraft={Boolean(draft)}
        canEdit={can(user, "EDITOR")}
        canDelete={can(user, "OWNER") && !page.system}
      />
    </>
  );
}
