"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { getCollection } from "@/admin/collections";
import { deleteItem, saveItem } from "@/app/admin/actions/collections";
import { FieldForm, type Options } from "@/components/admin/field-form";
import { AButton } from "@/components/admin/ui";

export function CollectionEditor({ collection, id, initial, sources, canEdit }: { collection: string; id: string | null; initial: Record<string, unknown>; sources: Options; canEdit: boolean }) {
  const def = getCollection(collection)!;
  const router = useRouter();
  const canDelete = canEdit && id && !["customers"].includes(collection);

  return (
    <div className="rounded-2xl border border-a-line bg-a-panel p-4 sm:p-6">
      <FieldForm
        fields={def.fields}
        initial={initial}
        options={sources}
        disabled={!canEdit}
        saveLabel={id ? "Save changes" : `Create ${def.singular.toLowerCase()}`}
        onSave={(values) => saveItem(collection, id, values)}
        onSaved={(data) => {
          const newId = (data as { id?: string } | null)?.id;
          if (!id && newId) router.replace(`/admin/c/${collection}/${newId}`);
          else router.refresh();
        }}
        extraActions={canDelete ? (
          <AButton variant="danger-ghost" onClick={async () => {
            if (!window.confirm(`Delete this ${def.singular.toLowerCase()}? This can't be undone.`)) return;
            const res = await deleteItem(collection, id);
            if (res.ok) { toast.success("Deleted"); router.push(`/admin/c/${collection}`); router.refresh(); }
            else toast.error(res.error);
          }}>Delete</AButton>
        ) : null}
      />
    </div>
  );
}
