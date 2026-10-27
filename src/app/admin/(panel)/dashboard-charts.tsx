"use client";

import { useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card } from "@/components/admin/ui";
import { formatINR } from "@/lib/utils";

type Day = { day: string; orders: number; revenue: number };

const tooltipStyle = { background: "var(--a-panel)", border: "1px solid var(--a-line)", borderRadius: 12, color: "var(--a-text)", fontSize: 12 };

/** Single-series charts: one hue (the admin accent), recessive grid, hover tooltips, table view for accessibility. */
export function DashboardCharts({ days, flavours }: { days: Day[]; flavours: { name: string; bottles: number }[] }) {
  const [metric, setMetric] = useState<"orders" | "revenue">("orders");
  const [table, setTable] = useState(false);
  const empty = days.every((d) => d.orders === 0);

  return (
    <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
      <Card
        title={metric === "orders" ? "Orders · last 30 days" : "Revenue · last 30 days"}
        actions={
          <div className="flex gap-1 text-xs" role="group" aria-label="Chart options">
            {(["orders", "revenue"] as const).map((m) => (
              <button key={m} type="button" aria-pressed={metric === m} onClick={() => setMetric(m)} className={`h-8 rounded-lg px-3 capitalize ${metric === m ? "bg-a-accent text-a-accent-ink" : "border border-a-line hover:bg-a-hover"}`}>{m}</button>
            ))}
            <button type="button" aria-pressed={table} onClick={() => setTable((t) => !t)} className="h-8 rounded-lg border border-a-line px-3 hover:bg-a-hover">{table ? "Chart" : "Table"}</button>
          </div>
        }
      >
        {table ? (
          <div className="max-h-72 overflow-y-auto text-sm">
            <table className="w-full"><thead className="text-xs text-a-muted"><tr><th className="py-1 text-left">Day</th><th className="py-1 text-right">Orders</th><th className="py-1 text-right">Revenue</th></tr></thead>
              <tbody>{days.map((d) => <tr key={d.day} className="border-t border-a-line"><td className="py-1">{d.day}</td><td className="py-1 text-right tabular-nums">{d.orders}</td><td className="py-1 text-right tabular-nums">{formatINR(d.revenue)}</td></tr>)}</tbody></table>
          </div>
        ) : empty ? (
          <p className="grid h-64 place-items-center text-sm text-a-muted">Your sales chart will fill up as orders come in.</p>
        ) : (
          <div className="h-64" role="img" aria-label={`Bar chart of ${metric} per day over the last 30 days`}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={days} margin={{ top: 4, right: 4, bottom: 0, left: -12 }} barCategoryGap={2}>
                <CartesianGrid vertical={false} stroke="var(--a-line)" />
                <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fill: "var(--a-muted)", fontSize: 11 }} interval={4} />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fill: "var(--a-muted)", fontSize: 11 }} tickFormatter={(v: number) => (metric === "revenue" ? `₹${v >= 1000 ? `${Math.round(v / 100) / 10}k` : v}` : String(v))} />
                <Tooltip cursor={{ fill: "var(--a-hover)" }} contentStyle={tooltipStyle} formatter={(v) => [metric === "revenue" ? formatINR(Number(v)) : String(v), metric === "revenue" ? "Revenue" : "Orders"]} />
                <Bar dataKey={metric} fill="var(--a-accent)" radius={[4, 4, 0, 0]} maxBarSize={22} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>
      <Card title="Bottles sold by flavour · 30 days">
        {flavours.length ? (
          <div style={{ height: Math.max(160, flavours.length * 40) }} role="img" aria-label="Bar chart of bottles sold per flavour">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={flavours} layout="vertical" margin={{ top: 0, right: 24, bottom: 0, left: 0 }} barCategoryGap={8}>
                <XAxis type="number" hide allowDecimals={false} />
                <YAxis type="category" dataKey="name" width={110} tickLine={false} axisLine={false} tick={{ fill: "var(--a-text)", fontSize: 12 }} />
                <Tooltip cursor={{ fill: "var(--a-hover)" }} contentStyle={tooltipStyle} formatter={(v) => [`${v} bottles`, "Sold"]} />
                <Bar dataKey="bottles" fill="var(--a-accent)" radius={[0, 4, 4, 0]} label={{ position: "right", fill: "var(--a-muted)", fontSize: 11 }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : <p className="grid h-40 place-items-center text-sm text-a-muted">No flavour sales in the last 30 days yet.</p>}
      </Card>
    </div>
  );
}
