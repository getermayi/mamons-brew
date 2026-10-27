"use client";

import { DndContext, PointerSensor, KeyboardSensor, closestCenter, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { createColumnHelper, createSortedRowModel, rowSortingFeature, sortFn_alphanumeric, sortFn_text, tableFeatures, useTable, type SortingState } from "@tanstack/react-table";
import Link from "next/link";
import { useId, useMemo, useState } from "react";
import type { Column } from "@/admin/collections";
import type { Cell, Row } from "@/app/admin/actions/collections";
import { cn, formatDate, formatINR } from "@/lib/utils";
import { AButton, AEmpty, AInput, ASelect, Badge, type BadgeTone } from "./ui";

const toneFor: Record<string, BadgeTone> = {
  NEW: "blue", REQUESTED: "blue", CONFIRMED: "purple", CONTACTED: "purple", OUT_FOR_DELIVERY: "amber", ACTIVE: "green", DELIVERED: "green", CONVERTED: "green",
  PUBLISHED: "green", IN_STOCK: "green", LOW_STOCK: "amber", PAUSED: "amber", SOLD_OUT: "red", CANCELLED: "red", CLOSED: "gray", DRAFT: "gray", COMING_SOON: "gray",
  PAID: "green", UNPAID: "amber", FAILED: "red",
};
export const pretty = (v: string) => v.toLowerCase().replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase());

export function CellView({ kind, value }: { kind?: Column["kind"]; value: Cell }) {
  if (value === null || value === "") return <span className="text-a-muted">—</span>;
  switch (kind) {
    case "badge": return <Badge tone={toneFor[String(value)] ?? "gray"}>{pretty(String(value))}</Badge>;
    case "date": return <span className="whitespace-nowrap tabular-nums">{formatDate(String(value))}</span>;
    case "money": return <span className="tabular-nums">{formatINR(Number(value))}</span>;
    case "number": return <span className="tabular-nums">{String(value)}</span>;
    case "bool": return value ? <Badge tone="green">Yes</Badge> : <Badge>No</Badge>;
    case "color": return <span className="inline-block size-5 rounded-full border border-a-line" style={{ background: String(value) }} aria-label={String(value)} />;
    // eslint-disable-next-line @next/next/no-img-element -- admin thumbnail
    case "image": return <img src={String(value)} alt="" className="size-10 rounded-lg object-cover" loading="lazy" />;
    default: return <span className="line-clamp-2">{String(value)}</span>;
  }
}

function toCsv(columns: Column[], rows: Row[]) {
  const esc = (v: Cell) => {
    const s = v === null ? "" : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const cols = columns.filter((c) => c.kind !== "image" && c.kind !== "color");
  return [cols.map((c) => c.label || c.key).join(","), ...rows.map((r) => cols.map((c) => esc(r.cells[c.key] ?? null)).join(","))].join("\n");
}

export function downloadCsv(name: string, csv: string) {
  const url = URL.createObjectURL(new Blob([`﻿${csv}`], { type: "text/csv;charset=utf-8" }));
  const a = Object.assign(document.createElement("a"), { href: url, download: `${name}-${new Date().toISOString().slice(0, 10)}.csv` });
  a.click();
  URL.revokeObjectURL(url);
}

const features = tableFeatures({ rowSortingFeature, sortedRowModel: createSortedRowModel(), sortFns: { alphanumeric: sortFn_alphanumeric, text: sortFn_text } });
const helper = createColumnHelper<typeof features, Row>();

type Props = {
  name: string;
  columns: Column[];
  rows: Row[];
  hrefFor: (r: Row) => string;
  canEdit: boolean;
  sortable?: boolean;
  onReorder?: (ids: string[]) => Promise<boolean>;
  onBulkDelete?: (ids: string[]) => Promise<boolean>;
  emptyTitle: string;
  emptyBody?: string;
  emptyAction?: React.ReactNode;
  initialFilter?: Record<string, string>;
};

export function DataTable({ name, columns, rows, hrefFor, canEdit, sortable, onReorder, onBulkDelete, emptyTitle, emptyBody, emptyAction, initialFilter = {} }: Props) {
  const [query, setQuery] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [filters, setFilters] = useState<Record<string, string>>(initialFilter);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [reordering, setReordering] = useState(false);
  const [order, setOrder] = useState(rows.map((r) => r.id));

  const filterCols = columns.filter((c) => c.filter);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => Object.entries(filters).every(([k, v]) => !v || String(r.cells[k]) === v) && (!q || `${r.title} ${Object.values(r.cells).join(" ")}`.toLowerCase().includes(q)));
  }, [rows, filters, query]);

  const colDefs = useMemo(() => helper.columns(columns.map((c) => helper.accessor((r) => r.cells[c.key] ?? null, {
    id: c.key,
    header: c.label,
    cell: (ctx) => <CellView kind={c.kind} value={ctx.row.original.cells[c.key] ?? null} />,
    enableSorting: c.kind !== "image" && c.kind !== "color",
    sortUndefined: "last",
  }))), [columns]);

  const table = useTable({ features, columns: colDefs, data: filtered, state: { sorting }, onSortingChange: setSorting });
  const visible = table.getRowModel().rows.map((r) => r.original);

  if (!rows.length) return <AEmpty title={emptyTitle} body={emptyBody} action={emptyAction} />;

  if (reordering) {
    const byId = new Map(rows.map((r) => [r.id, r]));
    return (
      <ReorderList
        items={order.map((id) => byId.get(id)).filter((r): r is Row => Boolean(r))}
        onChange={setOrder}
        onDone={async (save) => {
          if (save && onReorder && (await onReorder(order))) setReordering(false);
          if (!save) { setOrder(rows.map((r) => r.id)); setReordering(false); }
        }}
      />
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <AInput type="search" placeholder="Search…" value={query} onChange={(e) => setQuery(e.target.value)} className="sm:max-w-xs" aria-label={`Search ${name}`} />
        {filterCols.map((c) => {
          const values = Array.from(new Set(rows.map((r) => r.cells[c.key]).filter((v) => v !== null && v !== ""))).map(String).sort();
          return (
            <ASelect key={c.key} value={filters[c.key] ?? ""} onChange={(e) => setFilters((f) => ({ ...f, [c.key]: e.target.value }))} className="sm:w-44" aria-label={`Filter by ${c.label}`}>
              <option value="">All {c.label.toLowerCase()}</option>
              {values.map((v) => <option key={v} value={v}>{c.kind === "badge" ? pretty(v) : v}</option>)}
            </ASelect>
          );
        })}
        <div className="flex gap-2 sm:ml-auto">
          {selected.size && canEdit && onBulkDelete ? (
            <AButton variant="danger-ghost" onClick={async () => { if (window.confirm(`Delete ${selected.size} item(s)? This can't be undone.`) && (await onBulkDelete([...selected]))) setSelected(new Set()); }}>Delete {selected.size}</AButton>
          ) : null}
          {sortable && canEdit && onReorder ? <AButton onClick={() => { setOrder(rows.map((r) => r.id)); setReordering(true); }}>Reorder</AButton> : null}
          <AButton onClick={() => downloadCsv(name, toCsv(columns, visible))}>Export CSV</AButton>
        </div>
      </div>

      {/* Desktop table */}
      <div className="hidden overflow-x-auto rounded-2xl border border-a-line bg-a-panel md:block">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-a-line text-xs text-a-muted">
            <tr>
              {onBulkDelete && canEdit ? (
                <th className="w-10 px-4 py-3"><input type="checkbox" aria-label="Select all" checked={visible.length > 0 && visible.every((r) => selected.has(r.id))} onChange={(e) => setSelected(e.target.checked ? new Set(visible.map((r) => r.id)) : new Set())} /></th>
              ) : null}
              {table.getHeaderGroups()[0].headers.map((h) => (
                <th key={h.id} className="px-4 py-3 font-medium">
                  {h.column.getCanSort() ? (
                    <button type="button" onClick={h.column.getToggleSortingHandler()} className="inline-flex items-center gap-1 hover:text-a-text">
                      <table.FlexRender header={h} />
                      <span aria-hidden>{h.column.getIsSorted() === "asc" ? "↑" : h.column.getIsSorted() === "desc" ? "↓" : ""}</span>
                    </button>
                  ) : <table.FlexRender header={h} />}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-a-line">
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="group transition-colors hover:bg-a-hover">
                {onBulkDelete && canEdit ? (
                  <td className="px-4 py-3"><input type="checkbox" aria-label={`Select ${row.original.title}`} checked={selected.has(row.original.id)} onChange={(e) => setSelected((s) => { const n = new Set(s); if (e.target.checked) n.add(row.original.id); else n.delete(row.original.id); return n; })} /></td>
                ) : null}
                {row.getAllCells().map((cell, i) => (
                  <td key={cell.id} className="px-4 py-3 align-middle">
                    {i === 0 || (i === 1 && (columns[0].kind === "image" || columns[0].kind === "color")) ? (
                      <Link href={hrefFor(row.original)} className="font-medium hover:underline"><table.FlexRender cell={cell} /></Link>
                    ) : <table.FlexRender cell={cell} />}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {!visible.length ? <p className="p-8 text-center text-sm text-a-muted">No matches. Try a different search or filter.</p> : null}
      </div>

      {/* Mobile cards */}
      <ul className="space-y-2 md:hidden">
        {visible.map((r) => (
          <li key={r.id}>
            <Link href={hrefFor(r)} className="block rounded-2xl border border-a-line bg-a-panel p-4 active:bg-a-hover">
              <p className="font-medium">{r.title}</p>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-a-muted">
                {columns.slice(1).filter((c) => c.kind !== "image" && c.kind !== "color").map((c) => (
                  <span key={c.key} className="inline-flex items-center gap-1">{c.label ? <span className="text-xs">{c.label}:</span> : null}<CellView kind={c.kind} value={r.cells[c.key] ?? null} /></span>
                ))}
              </div>
            </Link>
          </li>
        ))}
      </ul>
      <p className="text-xs text-a-muted">{visible.length} of {rows.length}</p>
    </div>
  );
}

function ReorderList({ items, onChange, onDone }: { items: Row[]; onChange: (ids: string[]) => void; onDone: (save: boolean) => void }) {
  const dndId = useId();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));
  const ids = items.map((i) => i.id);
  const onDragEnd = (e: DragEndEvent) => {
    if (!e.over || e.active.id === e.over.id) return;
    onChange(arrayMove(ids, ids.indexOf(String(e.active.id)), ids.indexOf(String(e.over.id))));
  };
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between rounded-2xl border border-a-line bg-a-panel px-4 py-3 text-sm">
        <span>Drag rows (or use space + arrow keys) to set the order shown on the site.</span>
        <div className="flex gap-2"><AButton onClick={() => onDone(false)}>Cancel</AButton><AButton variant="primary" onClick={() => onDone(true)}>Save order</AButton></div>
      </div>
      <DndContext id={dndId} sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={ids} strategy={verticalListSortingStrategy}>
          <ul className="space-y-2">{items.map((r, i) => <SortItem key={r.id} id={r.id} label={r.title} index={i} />)}</ul>
        </SortableContext>
      </DndContext>
    </div>
  );
}

function SortItem({ id, label, index }: { id: string; label: string; index: number }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  return (
    <li ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }} {...attributes} {...listeners} className={cn("flex cursor-grab touch-none items-center gap-3 rounded-xl border border-a-line bg-a-panel px-4 py-3 text-sm active:cursor-grabbing", isDragging && "relative z-10 shadow-xl")}>
      <span className="text-a-muted">⋮⋮</span><span className="w-6 tabular-nums text-a-muted">{index + 1}</span><span className="font-medium">{label}</span>
    </li>
  );
}
