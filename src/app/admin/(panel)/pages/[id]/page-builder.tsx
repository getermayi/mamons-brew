"use client";

import { DndContext, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useRouter } from "next/navigation";
import { Dialog } from "radix-ui";
import { useId, useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { BLOCKS, getBlockDef } from "@/blocks/definitions";
import { deletePage, discardDraft, publishPage, saveDraft, savePageMeta, type DraftSection } from "@/app/admin/actions/pages";
import { FieldForm } from "@/components/admin/field-form";
import { AButton, ASwitch, Badge, Card } from "@/components/admin/ui";
import type { Field } from "@/lib/fields";
import { cn } from "@/lib/utils";

type PageMeta = { id: string; slug: string; system: boolean; title: string; status: "DRAFT" | "PUBLISHED"; seoTitle: string; seoDescription: string; ogImageUrl: string; noindex: boolean };

const metaFields: readonly Field[] = [
  { kind: "text", name: "title", label: "Page name", half: true },
  { kind: "text", name: "slug", label: "URL", half: true, help: "Core pages keep their URL" },
  { kind: "select", name: "status", label: "Visibility", half: true, options: [{ value: "PUBLISHED", label: "Live" }, { value: "DRAFT", label: "Hidden (draft)" }] },
  { kind: "boolean", name: "noindex", label: "Hide from Google", half: true },
  { kind: "text", name: "seoTitle", label: "SEO title", max: 70, help: "≈60 characters shows best in Google" },
  { kind: "textarea", name: "seoDescription", label: "SEO description", max: 170, rows: 2, help: "≈155 characters" },
  { kind: "media", name: "ogImageUrl", label: "Social share image (1200×630)", optional: true },
];

export function PageBuilder({ page, sections: initial, hasDraft: initialHasDraft, canEdit, canDelete }: { page: PageMeta; sections: DraftSection[]; hasDraft: boolean; canEdit: boolean; canDelete: boolean }) {
  const router = useRouter();
  const [sections, setSections] = useState(initial);
  const [selected, setSelected] = useState<string | null>(initial[0]?.id ?? null);
  const [hasDraft, setHasDraft] = useState(initialHasDraft);
  const [tab, setTab] = useState<"blocks" | "seo">("blocks");
  const [showPreview, setShowPreview] = useState(true);
  const [adding, setAdding] = useState(false);
  const [previewKey, setPreviewKey] = useState(0);
  const [pending, start] = useTransition();
  const iframe = useRef<HTMLIFrameElement>(null);
  const dndId = useId();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));

  const persist = async (next: DraftSection[], quiet = false) => {
    setSections(next);
    const r = await saveDraft(page.id, next);
    if (r.ok) {
      setHasDraft(true);
      setPreviewKey((k) => k + 1);
      if (!quiet) toast.success(r.message ?? "Draft saved");
    } else toast.error(r.error);
    return r;
  };

  const current = sections.find((s) => s.id === selected) ?? null;
  const currentDef = current ? getBlockDef(current.type) : null;

  const onDragEnd = (e: DragEndEvent) => {
    if (!e.over || e.active.id === e.over.id) return;
    const ids = sections.map((s) => s.id);
    void persist(arrayMove(sections, ids.indexOf(String(e.active.id)), ids.indexOf(String(e.over.id))), true);
  };

  const addBlock = (type: string) => {
    const def = getBlockDef(type);
    if (!def) return;
    const id = `new-${crypto.randomUUID().slice(0, 8)}`;
    const at = current ? sections.findIndex((s) => s.id === current.id) + 1 : sections.length;
    const next = [...sections.slice(0, at), { id, type, content: structuredClone(def.defaults) as Record<string, unknown>, visible: true }, ...sections.slice(at)];
    void persist(next);
    setSelected(id);
    setAdding(false);
  };

  return (
    <div className="space-y-4">
      {/* Publish bar */}
      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-a-line bg-a-panel px-4 py-3">
        {hasDraft ? <Badge tone="amber">Unpublished changes</Badge> : <Badge tone="green">Live version</Badge>}
        <Badge tone={page.status === "PUBLISHED" ? "green" : "gray"}>{page.status === "PUBLISHED" ? "Page is visible" : "Page is hidden"}</Badge>
        <div className="ml-auto flex flex-wrap gap-2">
          <AButton onClick={() => setShowPreview((p) => !p)} className="hidden xl:inline-flex">{showPreview ? "Hide preview" : "Show preview"}</AButton>
          <a href={`/admin/preview/${page.id}`} target="_blank" rel="noopener noreferrer" className="inline-flex h-10 items-center rounded-xl border border-a-line px-4 text-sm hover:bg-a-hover">Preview ↗</a>
          {canEdit && hasDraft ? <AButton disabled={pending} onClick={() => window.confirm("Throw away unpublished changes and go back to the live version?") && start(async () => { const r = await discardDraft(page.id); if (r.ok) { toast.success("Draft discarded"); router.refresh(); window.location.reload(); } else toast.error(r.error); })}>Discard draft</AButton> : null}
          {canEdit ? <AButton variant="primary" disabled={pending || !hasDraft} onClick={() => start(async () => { const r = await publishPage(page.id); if (r.ok) { setHasDraft(false); toast.success(r.message ?? "Published"); router.refresh(); } else toast.error(r.error); })}>Publish</AButton> : null}
        </div>
      </div>

      <div className="flex gap-1 rounded-xl border border-a-line bg-a-panel p-1 text-sm sm:w-fit" role="tablist">
        {(["blocks", "seo"] as const).map((t) => (
          <button key={t} type="button" role="tab" aria-selected={tab === t} onClick={() => setTab(t)} className={cn("h-9 flex-1 rounded-lg px-4", tab === t ? "bg-a-accent text-a-accent-ink" : "hover:bg-a-hover")}>{t === "blocks" ? "Content blocks" : "Page settings & SEO"}</button>
        ))}
      </div>

      {tab === "seo" ? (
        <Card title="Page settings & SEO" description="These save straight to the live site.">
          <FieldForm
            fields={metaFields}
            initial={page}
            disabled={!canEdit}
            onSave={(v) => savePageMeta(page.id, v)}
            onSaved={() => router.refresh()}
            extraActions={canDelete ? <AButton variant="danger-ghost" onClick={async () => { if (!window.confirm("Delete this page permanently?")) return; const r = await deletePage(page.id); if (r.ok) { toast.success("Page deleted"); router.push("/admin/pages"); } else toast.error(r.error); }}>Delete page</AButton> : null}
          />
        </Card>
      ) : (
        <div className={cn("grid gap-4", showPreview ? "xl:grid-cols-[18rem_minmax(0,1fr)_minmax(0,1fr)]" : "lg:grid-cols-[18rem_minmax(0,1fr)]")}>
          {/* Block list */}
          <div className="space-y-2">
            <DndContext id={dndId} sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
              <SortableContext items={sections.map((s) => s.id)} strategy={verticalListSortingStrategy}>
                <ul className="space-y-1.5">
                  {sections.map((s, i) => (
                    <BlockRow
                      key={s.id}
                      section={s}
                      index={i}
                      active={s.id === selected}
                      canEdit={canEdit}
                      onSelect={() => setSelected(s.id)}
                      onToggle={(v) => void persist(sections.map((x) => (x.id === s.id ? { ...x, visible: v } : x)), true)}
                      onDuplicate={() => { const id = `new-${crypto.randomUUID().slice(0, 8)}`; void persist([...sections.slice(0, i + 1), { ...structuredClone(s), id }, ...sections.slice(i + 1)]); setSelected(id); }}
                      onDelete={() => { if (window.confirm("Delete this block?")) { void persist(sections.filter((x) => x.id !== s.id)); setSelected(null); } }}
                    />
                  ))}
                </ul>
              </SortableContext>
            </DndContext>
            {canEdit ? <AButton variant="primary" className="w-full" onClick={() => setAdding(true)}>+ Add a block</AButton> : null}
            <p className="px-1 text-xs text-a-muted">Drag ⋮⋮ to reorder. Changes go to a draft — press Publish to make them live.</p>
          </div>

          {/* Editor */}
          <div className="min-w-0 rounded-2xl border border-a-line bg-a-panel p-4 sm:p-5">
            {current && currentDef ? (
              <>
                <div className="mb-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-a-muted">{currentDef.group}</p>
                  <h2 className="text-lg font-semibold">{currentDef.label}</h2>
                  <p className="text-sm text-a-muted">{currentDef.description}</p>
                </div>
                <FieldForm
                  key={current.id}
                  compact
                  fields={currentDef.fields}
                  initial={current.content}
                  disabled={!canEdit}
                  saveLabel="Save to draft"
                  onSave={(values) => persist(sections.map((x) => (x.id === current.id ? { ...x, content: values } : x)), true)}
                />
              </>
            ) : (
              <p className="py-16 text-center text-sm text-a-muted">Select a block on the left to edit it.</p>
            )}
          </div>

          {/* Live preview */}
          {showPreview ? (
            <div className="hidden min-w-0 xl:block">
              <div className="sticky top-6 overflow-hidden rounded-2xl border border-a-line bg-white">
                <div className="flex items-center gap-1.5 border-b border-a-line bg-a-bg px-3 py-2 text-xs text-a-muted"><span className="size-2.5 rounded-full bg-[#f04438]/60" /><span className="size-2.5 rounded-full bg-[#f79009]/60" /><span className="size-2.5 rounded-full bg-[#12b76a]/60" /><span className="ml-2 truncate">Preview — /{page.slug === "home" ? "" : page.slug}</span></div>
                <div className="relative h-[78vh] overflow-hidden">
                  <iframe ref={iframe} key={previewKey} title="Page preview" src={`/admin/preview/${page.id}?v=${previewKey}`} className="absolute left-0 top-0 h-[156%] w-[200%] origin-top-left scale-50 border-0" />
                </div>
              </div>
            </div>
          ) : null}
        </div>
      )}

      <Dialog.Root open={adding} onOpenChange={setAdding}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40" />
          <Dialog.Content aria-describedby={undefined} className="admin-root fixed inset-x-2 bottom-2 top-12 z-50 overflow-y-auto rounded-2xl border border-a-line bg-a-panel p-5 shadow-2xl sm:inset-x-auto sm:left-1/2 sm:top-1/2 sm:max-h-[80vh] sm:w-[min(52rem,94vw)] sm:-translate-x-1/2 sm:-translate-y-1/2" data-lenis-prevent>
            <div className="mb-4 flex items-center justify-between"><Dialog.Title className="text-lg font-semibold">Add a block</Dialog.Title><Dialog.Close className="grid size-8 place-items-center rounded-lg hover:bg-a-hover" aria-label="Close">✕</Dialog.Close></div>
            {(["Hero", "Story", "Commerce", "Social proof", "Engagement", "Layout"] as const).map((g) => (
              <div key={g} className="mb-5">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-a-muted">{g}</p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {BLOCKS.filter((b) => b.group === g).map((b) => (
                    <button key={b.type} type="button" onClick={() => addBlock(b.type)} className="rounded-xl border border-a-line p-3 text-left transition-colors hover:border-a-accent hover:bg-a-hover">
                      <p className="text-sm font-medium">{b.label}</p>
                      <p className="mt-0.5 text-xs text-a-muted">{b.description}</p>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}

function BlockRow({ section, index, active, canEdit, onSelect, onToggle, onDuplicate, onDelete }: { section: DraftSection; index: number; active: boolean; canEdit: boolean; onSelect: () => void; onToggle: (v: boolean) => void; onDuplicate: () => void; onDelete: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: section.id, disabled: !canEdit });
  const def = getBlockDef(section.type);
  const c = section.content;
  const summary = [c.title, c.headline, c.eyebrow, c.text].find((v): v is string => typeof v === "string" && v.length > 0)?.replace(/\*/g, "");
  return (
    <li ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }} className={cn("group rounded-xl border bg-a-panel", active ? "border-a-accent ring-1 ring-a-accent" : "border-a-line", isDragging && "relative z-10 shadow-xl", !section.visible && "opacity-60")}>
      <div className="flex items-center gap-1 p-1.5">
        {canEdit ? <button type="button" className="grid size-8 shrink-0 cursor-grab touch-none place-items-center rounded-lg text-a-muted hover:bg-a-hover" aria-label={`Drag ${def?.label ?? section.type}`} {...attributes} {...listeners}>⋮⋮</button> : null}
        <button type="button" onClick={onSelect} className="min-w-0 flex-1 px-1 py-1 text-left">
          <span className="block truncate text-sm font-medium">{index + 1}. {def?.label ?? section.type}</span>
          {summary ? <span className="block truncate text-xs text-a-muted">{summary}</span> : null}
        </button>
        {canEdit ? <ASwitch checked={section.visible} onChange={onToggle} label={section.visible ? "Hide block" : "Show block"} /> : null}
      </div>
      {active && canEdit ? (
        <div className="flex gap-1 border-t border-a-line px-2 py-1.5">
          <button type="button" onClick={onDuplicate} className="rounded-lg px-2 py-1 text-xs hover:bg-a-hover">Duplicate</button>
          <button type="button" onClick={onDelete} className="rounded-lg px-2 py-1 text-xs text-[#d92d20] hover:bg-[#d92d20]/10">Delete</button>
        </div>
      ) : null}
    </li>
  );
}
