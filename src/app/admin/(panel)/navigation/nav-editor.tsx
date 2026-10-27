"use client";

import { saveNavigation } from "@/app/admin/actions/settings";
import { FieldForm } from "@/components/admin/field-form";
import { Card } from "@/components/admin/ui";
import type { Field } from "@/lib/fields";

type Item = { label: string; href: string; children: { label: string; href: string }[] };

const fields = (childLabel: string): readonly Field[] => [
  {
    kind: "list", name: "items", label: "Menu items", itemLabel: "Item", max: 20, fields: [
      { kind: "text", name: "label", label: "Label", half: true },
      { kind: "text", name: "href", label: "Link", half: true, help: "/page or https://…" },
      { kind: "list", name: "children", label: childLabel, itemLabel: "Link", max: 20, fields: [{ kind: "text", name: "label", label: "Label", half: true }, { kind: "text", name: "href", label: "Link", half: true }] },
    ],
  },
];

export function NavEditor({ header, footer, canEdit }: { header: Item[]; footer: Item[]; canEdit: boolean }) {
  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <Card title="Header menu" description="Items with links inside show as dropdowns.">
        <FieldForm fields={fields("Dropdown links")} initial={{ items: header }} disabled={!canEdit} onSave={(v) => saveNavigation("header", v)} />
      </Card>
      <Card title="Footer columns" description="Each item is a column heading; its links appear underneath.">
        <FieldForm fields={fields("Column links")} initial={{ items: footer }} disabled={!canEdit} onSave={(v) => saveNavigation("footer", v)} />
      </Card>
    </div>
  );
}
