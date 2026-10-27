"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { getCollection } from "@/admin/collections";
import { bulkDelete, reorderItems, type Row } from "@/app/admin/actions/collections";
import { DataTable } from "@/components/admin/data-table";
import { ALink } from "@/components/admin/ui";

export function CollectionList({ collection, rows, canEdit, filter }: { collection: string; rows: Row[]; canEdit: boolean; filter: Record<string, string> }) {
  const def = getCollection(collection)!;
  const router = useRouter();
  return (
    <DataTable
      name={def.key}
      columns={def.columns}
      rows={rows}
      canEdit={canEdit}
      initialFilter={filter}
      hrefFor={(r) => `/admin/c/${def.key}/${r.id}`}
      sortable={def.sortable}
      onReorder={async (ids) => {
        const res = await reorderItems(def.key, ids);
        if (res.ok) { toast.success(res.message ?? "Saved"); router.refresh(); return true; }
        toast.error(res.error);
        return false;
      }}
      onBulkDelete={["customers"].includes(def.key) ? undefined : async (ids) => {
        const res = await bulkDelete(def.key, ids);
        if (res.ok) { toast.success(res.message ?? "Deleted"); router.refresh(); return true; }
        toast.error(res.error);
        return false;
      }}
      emptyTitle={def.group === "Inbox" ? `No ${def.label.toLowerCase()} yet` : `No ${def.label.toLowerCase()} yet`}
      emptyBody={def.group === "Inbox" || def.group === "Audience" ? "They'll appear here as soon as someone fills in the form on the website." : `Create your first ${def.singular.toLowerCase()}.`}
      emptyAction={def.creatable && canEdit ? <ALink href={`/admin/c/${def.key}/new`} variant="primary">+ New {def.singular.toLowerCase()}</ALink> : undefined}
    />
  );
}
