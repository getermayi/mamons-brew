"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { saveOrderNotes, setOrderStatus, setPaymentStatus } from "@/app/admin/actions/orders";
import { useUnsavedWarning } from "@/components/admin/unsaved";
import { AButton, ASelect, ATextarea, Card } from "@/components/admin/ui";
import { cn } from "@/lib/utils";

const PIPELINE = [
  { value: "NEW", label: "New" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "OUT_FOR_DELIVERY", label: "Out for delivery" },
  { value: "DELIVERED", label: "Delivered" },
];

export function OrderControls({ id, status, paymentStatus, canEdit }: { id: string; status: string; paymentStatus: string; canEdit: boolean }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const idx = PIPELINE.findIndex((p) => p.value === status);
  const cancelled = status === "CANCELLED";

  const set = (s: string) => start(async () => {
    const r = await setOrderStatus(id, s);
    if (r.ok) { toast.success(r.message ?? "Updated"); router.refresh(); } else toast.error(r.error);
  });

  return (
    <Card title="Status" actions={canEdit ? (
      <ASelect aria-label="Payment status" value={paymentStatus} disabled={pending} className="h-9 w-36" onChange={(e) => start(async () => {
        const r = await setPaymentStatus(id, e.target.value);
        if (r.ok) { toast.success("Payment updated"); router.refresh(); } else toast.error(r.error);
      })}>
        <option value="UNPAID">Unpaid</option><option value="PAID">Paid</option><option value="FAILED">Failed</option><option value="REFUNDED">Refunded</option>
      </ASelect>
    ) : null}>
      <ol className="grid grid-cols-2 gap-2 sm:grid-cols-4" aria-label="Order pipeline">
        {PIPELINE.map((p, i) => {
          const done = !cancelled && i <= idx;
          return (
            <li key={p.value}>
              <button
                type="button"
                disabled={!canEdit || pending}
                onClick={() => set(p.value)}
                aria-current={status === p.value ? "step" : undefined}
                className={cn("flex h-14 w-full flex-col items-start justify-center rounded-xl border px-3 text-left text-sm transition-colors disabled:cursor-default", done ? "border-a-accent bg-a-accent text-a-accent-ink" : "border-a-line hover:bg-a-hover")}
              >
                <span className="text-[11px] opacity-70">Step {i + 1}</span>
                <span className="font-medium">{p.label}</span>
              </button>
            </li>
          );
        })}
      </ol>
      {canEdit ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {!cancelled && idx < PIPELINE.length - 1 ? <AButton variant="primary" disabled={pending} onClick={() => set(PIPELINE[idx + 1].value)}>Move to “{PIPELINE[idx + 1].label}”</AButton> : null}
          {cancelled ? <AButton disabled={pending} onClick={() => set("NEW")}>Reopen order</AButton> : <AButton variant="danger-ghost" disabled={pending} onClick={() => window.confirm("Cancel this order?") && set("CANCELLED")}>Cancel order</AButton>}
        </div>
      ) : null}
    </Card>
  );
}

export function OrderNotes({ id, notes, canEdit }: { id: string; notes: string; canEdit: boolean }) {
  const [value, setValue] = useState(notes);
  const [saved, setSaved] = useState(notes);
  const [pending, start] = useTransition();
  useUnsavedWarning(value !== saved);
  return (
    <Card title="Internal notes" description="Only your team sees these.">
      <ATextarea aria-label="Internal notes" value={value} onChange={(e) => setValue(e.target.value)} disabled={!canEdit} rows={4} placeholder="e.g. Customer returning 4 bottles, deliver after 5pm" />
      {canEdit ? (
        <div className="mt-3 flex justify-end">
          <AButton variant="primary" disabled={pending || value === saved} onClick={() => start(async () => {
            const r = await saveOrderNotes(id, value);
            if (r.ok) { setSaved(value); toast.success("Notes saved"); } else toast.error(r.error);
          })}>Save notes</AButton>
        </div>
      ) : null}
    </Card>
  );
}
