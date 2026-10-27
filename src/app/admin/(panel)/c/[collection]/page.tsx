import { notFound } from "next/navigation";
import { getCollection } from "@/admin/collections";
import { listRows } from "@/app/admin/actions/collections";
import { ALink, PageHeader } from "@/components/admin/ui";
import { can, requireAdmin } from "@/lib/session";
import { CollectionList } from "./collection-list";

export default async function CollectionPage({ params, searchParams }: PageProps<"/admin/c/[collection]">) {
  const { collection } = await params;
  const sp = await searchParams;
  const def = getCollection(collection);
  if (!def) notFound();
  const user = await requireAdmin();
  const rows = await listRows(collection);
  const editable = can(user, "EDITOR");
  const filter = Object.fromEntries(Object.entries(sp).filter((e): e is [string, string] => typeof e[1] === "string"));

  return (
    <>
      <PageHeader
        title={def.label}
        description={def.description}
        actions={def.creatable && editable ? <ALink href={`/admin/c/${def.key}/new`} variant="primary">+ New {def.singular.toLowerCase()}</ALink> : null}
      />
      <CollectionList collection={def.key} rows={rows} canEdit={editable} filter={filter} />
    </>
  );
}
