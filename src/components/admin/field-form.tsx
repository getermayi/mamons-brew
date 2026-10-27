"use client";

import { DndContext, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { createContext, use, useEffect, useId, useMemo, useState, type ReactNode } from "react";
import { Controller, useForm, type FieldErrors } from "react-hook-form";
import { toast } from "sonner";
import type { ActionResult } from "@/lib/admin-action";
import { emptyValues, fieldsSchema, type Field, type ImageValue, type LinkValue } from "@/lib/fields";
import { cn } from "@/lib/utils";
import { MediaPickerDialog } from "./media-picker";
import { RichTextEditor } from "./rich-text-editor";
import { AButton, AInput, ALabel, ASelect, ASwitch, ATextarea } from "./ui";
import { useUnsavedWarning } from "./unsaved";

export type Options = Record<string, readonly { value: string; label: string }[]>;

const Ctx = createContext<{ errorAt: (path: string) => string | undefined; options: Options; disabled: boolean }>({ errorAt: () => undefined, options: {}, disabled: false });

function getPath(obj: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((acc, k) => (acc && typeof acc === "object" ? (acc as Record<string, unknown>)[k] : undefined), obj);
}

type Props = {
  fields: readonly Field[];
  initial: Record<string, unknown>;
  onSave: (values: Record<string, unknown>) => Promise<ActionResult<unknown>>;
  options?: Options;
  disabled?: boolean;
  saveLabel?: string;
  /** Rendered above the fields, inside the form (e.g. a title). */
  header?: ReactNode;
  /** Extra buttons in the save bar (left side). */
  extraActions?: ReactNode;
  onSaved?: (data: unknown) => void;
  /** Called on every change — used by the page builder to keep its draft in sync. */
  onValuesChange?: (values: Record<string, unknown>) => void;
  compact?: boolean;
};

/** Renders any list of field descriptors as a validated form with a sticky save bar. */
export function FieldForm({ fields, initial, onSave, options = {}, disabled = false, saveLabel = "Save changes", header, extraActions, onSaved, onValuesChange, compact }: Props) {
  const defaults = useMemo(() => ({ ...emptyValues(fields), ...initial }), [fields, initial]);
  const form = useForm<Record<string, unknown>>({ defaultValues: defaults });
  const { control, handleSubmit, formState, reset, setError, watch } = form;
  const schema = useMemo(() => fieldsSchema(fields), [fields]);
  useUnsavedWarning(formState.isDirty && !disabled);

  useEffect(() => {
    if (!onValuesChange) return;
    const sub = watch((v) => onValuesChange(v as Record<string, unknown>));
    return () => sub.unsubscribe();
  }, [watch, onValuesChange]);

  const submit = handleSubmit(async (values) => {
    const parsed = schema.safeParse(values);
    if (!parsed.success) {
      for (const issue of parsed.error.issues) setError(issue.path.join("."), { message: issue.message });
      toast.error("Some fields need attention.");
      return;
    }
    const res = await onSave(parsed.data as Record<string, unknown>);
    if (res.ok) {
      toast.success(res.message ?? "Saved — the site is updated.");
      reset(values);
      onSaved?.(res.data);
    } else {
      for (const [k, v] of Object.entries(res.fieldErrors ?? {})) setError(k, { message: v });
      toast.error(res.error);
    }
  });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        if (!disabled) void submit();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [submit, disabled]);

  const errorAt = (path: string) => {
    const e = getPath(formState.errors as FieldErrors, path) as { message?: string } | undefined;
    return typeof e?.message === "string" ? e.message : undefined;
  };

  return (
    <Ctx value={{ errorAt, options, disabled }}>
      <form onSubmit={submit} noValidate className="relative">
        {header}
        <div className={cn("grid gap-x-4", compact ? "gap-y-4" : "gap-y-5", "sm:grid-cols-2")}>
          {fields.map((f) => (
            <div key={f.name} className={f.half ? "" : "sm:col-span-2"}>
              <Controller control={control} name={f.name} render={({ field }) => <FieldInput def={f} path={f.name} value={field.value} onChange={field.onChange} />} />
            </div>
          ))}
        </div>
        <div className={cn("sticky bottom-0 z-10 -mx-1 mt-6 flex flex-wrap items-center gap-2 rounded-2xl border border-a-line bg-a-panel/95 px-3 py-3 shadow-lg backdrop-blur transition-opacity", !formState.isDirty && "shadow-none")}>
          {extraActions}
          <span className={cn("ml-auto text-xs", formState.isDirty ? "text-[#b54708] dark:text-[#fec84b]" : "text-a-muted")}>
            {disabled ? "View only" : formState.isDirty ? "Unsaved changes" : "All changes saved"}
          </span>
          {formState.isDirty && !disabled ? <AButton size="md" onClick={() => reset(defaults)}>Discard</AButton> : null}
          <AButton type="submit" variant="primary" disabled={disabled || formState.isSubmitting}>{formState.isSubmitting ? "Saving…" : saveLabel}</AButton>
        </div>
      </form>
    </Ctx>
  );
}

// ─── Individual inputs ──────────────────────────────────────────────

export function FieldInput({ def, path, value, onChange }: { def: Field; path: string; value: unknown; onChange: (v: unknown) => void }) {
  const { errorAt, options, disabled: allDisabled } = use(Ctx);
  const id = useId();
  const error = errorAt(path);
  const disabled = allDisabled || def.readOnly;
  const label = <ALabel htmlFor={id} hint={def.help} error={error}>{def.label}</ALabel>;
  const str = typeof value === "string" ? value : value === null || value === undefined ? "" : String(value);

  switch (def.kind) {
    case "text":
      return <div>{label}<AInput id={id} value={str} placeholder={def.placeholder} disabled={disabled} aria-invalid={Boolean(error)} onChange={(e) => onChange(e.target.value)} /></div>;
    case "textarea":
      return <div>{label}<ATextarea id={id} value={str} rows={def.rows ?? 3} placeholder={def.placeholder} disabled={disabled} aria-invalid={Boolean(error)} onChange={(e) => onChange(e.target.value)} /></div>;
    case "number":
      return <div>{label}<AInput id={id} type="number" inputMode="decimal" value={str} min={def.min} max={def.max} disabled={disabled} aria-invalid={Boolean(error)} onChange={(e) => onChange(e.target.value === "" ? "" : Number(e.target.value))} /></div>;
    case "date":
      return <div>{label}<AInput id={id} type={def.withTime ? "datetime-local" : "date"} value={str} disabled={disabled} aria-invalid={Boolean(error)} onChange={(e) => onChange(e.target.value)} /></div>;
    case "color":
      return (
        <div>
          {label}
          <div className="flex items-center gap-2">
            <input type="color" aria-label={`${def.label} picker`} value={/^#[0-9a-f]{6}$/i.test(str) ? str : "#000000"} disabled={disabled} onChange={(e) => onChange(e.target.value.toUpperCase())} className="h-10 w-12 cursor-pointer rounded-lg border border-a-line bg-a-panel p-1" />
            <AInput id={id} value={str} disabled={disabled} aria-invalid={Boolean(error)} onChange={(e) => onChange(e.target.value)} className="font-mono uppercase" />
          </div>
        </div>
      );
    case "boolean":
      return (
        <div className="flex items-center justify-between gap-4 rounded-xl border border-a-line px-4 py-3">
          <div>
            <label htmlFor={id} className="text-[13px] font-medium">{def.label}</label>
            {def.help ? <p className="text-xs text-a-muted">{def.help}</p> : null}
          </div>
          <ASwitch id={id} checked={value === true} disabled={disabled} onChange={onChange} />
        </div>
      );
    case "select": {
      const opts = def.source ? options[def.source] ?? [] : def.options;
      return (
        <div>{label}
          <ASelect id={id} value={str} disabled={disabled} aria-invalid={Boolean(error)} onChange={(e) => onChange(e.target.value)}>
            {def.source || def.optional ? <option value="">—</option> : null}
            {opts.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </ASelect>
        </div>
      );
    }
    case "tags":
      return <div>{label}<TagsInput id={id} value={Array.isArray(value) ? (value as string[]) : []} onChange={onChange} disabled={disabled} /></div>;
    case "richtext":
      return <div>{label}<RichTextEditor id={id} value={str} onChange={onChange} disabled={disabled} /></div>;
    case "link": {
      const v = (value as LinkValue | undefined) ?? { label: "", href: "" };
      return (
        <fieldset>
          <legend className="mb-1.5 text-[13px] font-medium">{def.label}{def.help ? <span className="ml-2 text-xs font-normal text-a-muted">{def.help}</span> : null}</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            <AInput aria-label={`${def.label} text`} placeholder="Button text" value={v.label} disabled={disabled} onChange={(e) => onChange({ ...v, label: e.target.value })} />
            <AInput aria-label={`${def.label} link`} placeholder="/page, https://… or whatsapp" value={v.href} disabled={disabled} onChange={(e) => onChange({ ...v, href: e.target.value })} />
          </div>
          {error ? <p className="mt-1 text-xs text-[#d92d20]">{error}</p> : null}
        </fieldset>
      );
    }
    case "image": {
      const v = (value as ImageValue | undefined) ?? { url: "", alt: "" };
      return <div>{label}<ImageInput url={v.url} alt={v.alt} withAlt disabled={disabled} onChange={(url, alt) => onChange({ url, alt: alt ?? v.alt })} /></div>;
    }
    case "media":
      return <div>{label}<ImageInput url={str} disabled={disabled} onChange={(url) => onChange(url)} /></div>;
    case "list":
      return <ListEditor def={def} path={path} value={Array.isArray(value) ? (value as Record<string, unknown>[]) : []} onChange={onChange} />;
  }
}

function ImageInput({ url, alt, withAlt, onChange, disabled }: { url: string; alt?: string; withAlt?: boolean; onChange: (url: string, alt?: string) => void; disabled?: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex gap-3 rounded-xl border border-a-line p-2.5">
      <div className="grid size-20 shrink-0 place-items-center overflow-hidden rounded-lg bg-a-hover">
        {/* eslint-disable-next-line @next/next/no-img-element -- admin thumbnail */}
        {url ? <img src={url} alt="" className="size-full object-cover" /> : <span className="text-xs text-a-muted">No image</span>}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        {withAlt ? <AInput aria-label="Alt text" placeholder="Alt text (describe the image)" value={alt ?? ""} disabled={disabled} onChange={(e) => onChange(url, e.target.value)} /> : <p className="truncate pt-2 text-xs text-a-muted">{url || "Pick from the media library or upload"}</p>}
        <div className="flex gap-2">
          <AButton size="sm" disabled={disabled} onClick={() => setOpen(true)}>{url ? "Replace" : "Choose image"}</AButton>
          {url ? <AButton size="sm" variant="ghost" disabled={disabled} onClick={() => onChange("", "")}>Remove</AButton> : null}
        </div>
      </div>
      <MediaPickerDialog open={open} onOpenChange={setOpen} onPick={(m) => { onChange(m.url, withAlt ? (alt || m.alt) : undefined); setOpen(false); }} />
    </div>
  );
}

function TagsInput({ id, value, onChange, disabled }: { id: string; value: string[]; onChange: (v: string[]) => void; disabled?: boolean }) {
  const [draft, setDraft] = useState("");
  const add = () => {
    const t = draft.trim().replace(/,$/, "");
    if (t && !value.includes(t)) onChange([...value, t]);
    setDraft("");
  };
  return (
    <div className="flex min-h-10 flex-wrap items-center gap-1.5 rounded-xl border border-a-line bg-a-panel p-1.5 focus-within:border-a-accent">
      {value.map((t) => (
        <span key={t} className="inline-flex items-center gap-1 rounded-lg bg-a-hover px-2 py-1 text-xs">
          {t}
          {!disabled ? <button type="button" aria-label={`Remove ${t}`} className="text-a-muted hover:text-a-text" onClick={() => onChange(value.filter((x) => x !== t))}>×</button> : null}
        </span>
      ))}
      <input
        id={id}
        value={draft}
        disabled={disabled}
        placeholder={value.length ? "" : "Type and press Enter"}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") { e.preventDefault(); add(); }
          if (e.key === "Backspace" && !draft && value.length) onChange(value.slice(0, -1));
        }}
        onBlur={add}
        className="h-7 min-w-24 flex-1 bg-transparent px-1 text-sm outline-none"
      />
    </div>
  );
}

// ─── Repeatable lists (drag to reorder) ─────────────────────────────

type ListDef = Extract<Field, { kind: "list" }>;
type Row = Record<string, unknown> & { __k?: string };

function ListEditor({ def, path, value, onChange }: { def: ListDef; path: string; value: Record<string, unknown>[]; onChange: (v: unknown) => void }) {
  const { disabled } = use(Ctx);
  const [keys, setKeys] = useState<string[]>(() => value.map(() => crypto.randomUUID()));
  const [open, setOpen] = useState<string | null>(null);
  const dndId = useId();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));

  // keep keys aligned when value length changes from outside (e.g. Discard)
  const aligned = keys.length === value.length ? keys : value.map((_, i) => keys[i] ?? crypto.randomUUID());
  if (aligned !== keys) queueMicrotask(() => setKeys(aligned));

  const update = (next: Record<string, unknown>[], nextKeys: string[]) => { setKeys(nextKeys); onChange(next); };
  const onDragEnd = (e: DragEndEvent) => {
    if (!e.over || e.active.id === e.over.id) return;
    const from = aligned.indexOf(String(e.active.id));
    const to = aligned.indexOf(String(e.over.id));
    update(arrayMove(value, from, to), arrayMove(aligned, from, to));
  };
  const titleOf = (row: Row, i: number) => {
    const first = def.fields.find((f) => f.kind === "text" || f.kind === "textarea");
    const t = first ? row[first.name] : "";
    return typeof t === "string" && t ? t : `${def.itemLabel} ${i + 1}`;
  };

  return (
    <fieldset>
      <legend className="mb-2 flex w-full items-center justify-between text-[13px] font-medium">
        <span>{def.label} <span className="font-normal text-a-muted">({value.length})</span></span>
      </legend>
      <DndContext id={dndId} sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={aligned} strategy={verticalListSortingStrategy}>
          <ul className="space-y-2">
            {value.map((row, i) => (
              <SortableRow key={aligned[i]} id={aligned[i]} title={titleOf(row, i)} open={open === aligned[i]} onToggle={() => setOpen(open === aligned[i] ? null : aligned[i])} disabled={disabled}
                onDuplicate={() => update([...value.slice(0, i + 1), structuredClone(row), ...value.slice(i + 1)], [...aligned.slice(0, i + 1), crypto.randomUUID(), ...aligned.slice(i + 1)])}
                onRemove={() => update(value.filter((_, j) => j !== i), aligned.filter((_, j) => j !== i))}
              >
                <div className="grid gap-3 sm:grid-cols-2">
                  {def.fields.map((sub) => (
                    <div key={sub.name} className={sub.half || sub.kind === "select" || sub.kind === "number" || sub.kind === "boolean" ? "" : "sm:col-span-2"}>
                      <FieldInput def={sub} path={`${path}.${i}.${sub.name}`} value={row[sub.name]} onChange={(v) => update(value.map((r, j) => (j === i ? { ...r, [sub.name]: v } : r)), aligned)} />
                    </div>
                  ))}
                </div>
              </SortableRow>
            ))}
          </ul>
        </SortableContext>
      </DndContext>
      {!disabled && (def.max === undefined || value.length < def.max) ? (
        <AButton size="sm" className="mt-2" onClick={() => { const k = crypto.randomUUID(); update([...value, emptyValues(def.fields)], [...aligned, k]); setOpen(k); }}>+ Add {def.itemLabel.toLowerCase()}</AButton>
      ) : null}
    </fieldset>
  );
}

function SortableRow({ id, title, open, onToggle, onDuplicate, onRemove, disabled, children }: { id: string; title: string; open: boolean; onToggle: () => void; onDuplicate: () => void; onRemove: () => void; disabled: boolean; children: ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id, disabled });
  return (
    <li ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }} className={cn("rounded-xl border border-a-line bg-a-panel", isDragging && "relative z-10 shadow-xl")}>
      <div className="flex items-center gap-1 px-2 py-1.5">
        <button type="button" className="grid size-8 cursor-grab touch-none place-items-center rounded-lg text-a-muted hover:bg-a-hover active:cursor-grabbing" aria-label={`Drag to reorder ${title}`} {...attributes} {...listeners}>⋮⋮</button>
        <button type="button" onClick={onToggle} aria-expanded={open} className="min-w-0 flex-1 truncate px-1 py-1.5 text-left text-sm font-medium">{title}</button>
        {!disabled ? (
          <>
            <button type="button" onClick={onDuplicate} className="rounded-lg px-2 py-1 text-xs text-a-muted hover:bg-a-hover" title="Duplicate">Copy</button>
            <button type="button" onClick={() => window.confirm(`Remove “${title}”?`) && onRemove()} className="rounded-lg px-2 py-1 text-xs text-[#d92d20] hover:bg-[#d92d20]/10" title="Remove">Remove</button>
          </>
        ) : null}
        <span aria-hidden className={cn("px-1 text-a-muted transition-transform", open && "rotate-180")}>⌄</span>
      </div>
      {open ? <div className="border-t border-a-line p-3">{children}</div> : null}
    </li>
  );
}
