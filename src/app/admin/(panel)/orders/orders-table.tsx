"use client";

import Link from "next/link";
import { useState } from "react";
import { CellView, downloadCsv, pretty } from "@/components/admin/data-table";
import { AEmpty, AInput, ASelect, Badge } from "@/components/admin/ui";
import { cn, formatDate, formatINR } from "@/lib/utils";

type O = { id: string; number: string; name: string; phone: string; area: string; fulfilment: string; status: string; paymentStatus: string; paymentMethod: string; total: number; bottles: number; createdAt: string; preferredDate: string };

const STATUSES = ["NEW", "CONFIRMED", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED"];

export function OrdersTable({ orders, initialStatus }: { orders: O[]; initialStatus: string }) {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState(initialStatus);
  const [area, setArea] = useState("");
  const [range, setRange] = useState("all");
  const [since, setSince] = useState<number | null>(null);
  const areas = Array.from(new Set(orders.map((o) => o.area))).sort();

  const needle = q.trim().toLowerCase();
  const shown = orders.filter((o) => (!status || o.status === status) && (!area || o.area === area) && (since === null || new Date(o.createdAt).getTime() >= since) && (!needle || `${o.number} ${o.name} ${o.phone}`.toLowerCase().includes(needle)));

  const counts = Object.fromEntries(STATUSES.map((s) => [s, orders.filter((o) => o.status === s).length]));
  if (!orders.length) return <AEmpty title="No orders yet" body="When someone checks out on the website, the order lands here and WhatsApp opens for them with the details." />;

  return (
    <div className="space-y-4">
      <div className="flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Order status">
        {["", ...STATUSES].map((s) => (
          <button key={s || "all"} type="button" role="tab" aria-selected={status === s} onClick={() => setStatus(s)} className={cn("flex h-9 shrink-0 items-center gap-2 rounded-xl border px-3 text-sm", status === s ? "border-a-accent bg-a-accent text-a-accent-ink" : "border-a-line bg-a-panel hover:bg-a-hover")}>
            {s ? pretty(s) : "All"} <span className="text-xs opacity-70 tabular-nums">{s ? counts[s] : orders.length}</span>
          </button>
        ))}
      </div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <AInput type="search" placeholder="Search order #, name or phone" value={q} onChange={(e) => setQ(e.target.value)} className="sm:max-w-xs" aria-label="Search orders" />
        <ASelect value={area} onChange={(e) => setArea(e.target.value)} className="sm:w-44" aria-label="Area"><option value="">All areas</option>{areas.map((a) => <option key={a}>{a}</option>)}</ASelect>
        <ASelect value={range} onChange={(e) => {
          const v = e.target.value;
          setRange(v);
          setSince(v === "today" ? new Date().setHours(0, 0, 0, 0) : v === "7" ? Date.now() - 7 * 864e5 : v === "30" ? Date.now() - 30 * 864e5 : null);
        }} className="sm:w-40" aria-label="Date range"><option value="all">All time</option><option value="today">Today</option><option value="7">Last 7 days</option><option value="30">Last 30 days</option></ASelect>
        <button type="button" className="h-10 rounded-xl border border-a-line bg-a-panel px-4 text-sm hover:bg-a-hover sm:ml-auto" onClick={() => downloadCsv("orders", [
          "Order,Date,Customer,Phone,Area,Fulfilment,Bottles,Total,Status,Payment",
          ...shown.map((o) => [o.number, formatDate(o.createdAt), o.name, o.phone, o.area, o.fulfilment, o.bottles, o.total, o.status, o.paymentStatus].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")),
        ].join("\n"))}>Export CSV</button>
      </div>

      <div className="hidden overflow-x-auto rounded-2xl border border-a-line bg-a-panel md:block">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-a-line text-xs text-a-muted">
            <tr>{["Order", "Date", "Customer", "Area", "Bottles", "Total", "Status", "Payment"].map((h) => <th key={h} className="px-4 py-3 font-medium">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-a-line">
            {shown.map((o) => (
              <tr key={o.id} className="hover:bg-a-hover">
                <td className="px-4 py-3"><Link href={`/admin/orders/${o.id}`} className="font-medium hover:underline">{o.number}</Link></td>
                <td className="whitespace-nowrap px-4 py-3 text-a-muted">{formatDate(o.createdAt, { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })}</td>
                <td className="px-4 py-3">{o.name}<span className="block text-xs text-a-muted">{o.phone}</span></td>
                <td className="px-4 py-3">{o.area}<span className="block text-xs text-a-muted">{o.fulfilment === "PICKUP" ? "Pickup" : "Delivery"}</span></td>
                <td className="px-4 py-3 tabular-nums">{o.bottles}</td>
                <td className="px-4 py-3 font-medium tabular-nums">{formatINR(o.total)}</td>
                <td className="px-4 py-3"><CellView kind="badge" value={o.status} /></td>
                <td className="px-4 py-3"><CellView kind="badge" value={o.paymentStatus} /></td>
              </tr>
            ))}
          </tbody>
        </table>
        {!shown.length ? <p className="p-8 text-center text-sm text-a-muted">No orders match these filters.</p> : null}
      </div>

      <ul className="space-y-2 md:hidden">
        {shown.map((o) => (
          <li key={o.id}>
            <Link href={`/admin/orders/${o.id}`} className="block rounded-2xl border border-a-line bg-a-panel p-4">
              <div className="flex items-center justify-between"><span className="font-semibold">{o.number}</span><span className="font-semibold tabular-nums">{formatINR(o.total)}</span></div>
              <p className="mt-1 text-sm">{o.name} · {o.area}</p>
              <div className="mt-2 flex items-center gap-2 text-xs text-a-muted"><CellView kind="badge" value={o.status} /> {o.bottles} bottles · {formatDate(o.createdAt, { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })}{o.paymentStatus === "PAID" ? <Badge tone="green">Paid</Badge> : null}</div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
