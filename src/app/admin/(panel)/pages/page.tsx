import Link from "next/link";
import { Badge, PageHeader } from "@/components/admin/ui";
import { db } from "@/lib/db";
import { can, requireAdmin } from "@/lib/session";
import { formatDate } from "@/lib/utils";
import { NewPageButton } from "./new-page-button";

export default async function PagesList() {
  const user = await requireAdmin();
  const pages = await db.page.findMany({ orderBy: [{ system: "desc" }, { title: "asc" }], include: { _count: { select: { sections: true } } } });
  return (
    <>
      <PageHeader title="Pages" description="Every page is built from blocks. Open one to edit its text and images, reorder or hide blocks, and set its SEO." actions={can(user, "EDITOR") ? <NewPageButton /> : null} />
      <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {pages.map((p) => (
          <li key={p.id}>
            <Link href={`/admin/pages/${p.id}`} className="flex h-full flex-col rounded-2xl border border-a-line bg-a-panel p-5 transition-colors hover:border-a-accent">
              <div className="flex items-start justify-between gap-3">
                <p className="font-semibold">{p.title}</p>
                <div className="flex gap-1">
                  {p.draft ? <Badge tone="amber">Unpublished edits</Badge> : null}
                  <Badge tone={p.status === "PUBLISHED" ? "green" : "gray"}>{p.status === "PUBLISHED" ? "Live" : "Draft"}</Badge>
                </div>
              </div>
              <p className="mt-1 text-sm text-a-muted">/{p.slug === "home" ? "" : p.slug}</p>
              <p className="mt-auto pt-4 text-xs text-a-muted">{p._count.sections} blocks · updated {formatDate(p.updatedAt)}</p>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
