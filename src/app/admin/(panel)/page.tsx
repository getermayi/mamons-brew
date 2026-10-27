import Link from "next/link";
import { CellView } from "@/components/admin/data-table";
import { ALink, Card, PageHeader, Stat } from "@/components/admin/ui";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { formatDate, formatINR } from "@/lib/utils";
import { DashboardCharts } from "./dashboard-charts";

function istMidnight(daysAgo = 0) {
  const now = new Date();
  const ist = new Date(now.getTime() + 5.5 * 36e5);
  ist.setUTCHours(0, 0, 0, 0);
  return new Date(ist.getTime() - 5.5 * 36e5 - daysAgo * 864e5);
}

export default async function Dashboard({ searchParams }: PageProps<"/admin">) {
  const user = await requireAdmin();
  const sp = await searchParams;
  const today = istMidnight();
  const week = istMidnight(6);
  const month = istMidnight(29);
  const prevWeek = istMidnight(13);
  const live = { status: { not: "CANCELLED" as const } };

  const [ordersToday, ordersWeek, revWeek, revPrevWeek, revMonth, pending, newEnquiries, waClicks, recentOrders, recentEnquiries, monthOrders, topItems] = await Promise.all([
    db.order.count({ where: { ...live, createdAt: { gte: today } } }),
    db.order.count({ where: { ...live, createdAt: { gte: week } } }),
    db.order.aggregate({ _sum: { total: true }, where: { ...live, createdAt: { gte: week } } }),
    db.order.aggregate({ _sum: { total: true }, where: { ...live, createdAt: { gte: prevWeek, lt: week } } }),
    db.order.aggregate({ _sum: { total: true }, where: { ...live, createdAt: { gte: month } } }),
    db.order.count({ where: { status: { in: ["NEW", "CONFIRMED", "OUT_FOR_DELIVERY"] } } }),
    db.enquiry.count({ where: { status: "NEW" } }),
    db.analyticsEvent.count({ where: { type: "whatsapp_click", createdAt: { gte: week } } }),
    db.order.findMany({ orderBy: { createdAt: "desc" }, take: 6 }),
    db.enquiry.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
    db.order.findMany({ where: { ...live, createdAt: { gte: month } }, select: { createdAt: true, total: true } }),
    db.orderItem.groupBy({ by: ["name"], _sum: { quantity: true }, where: { order: { ...live, createdAt: { gte: month } } }, orderBy: { _sum: { quantity: "desc" } }, take: 8 }),
  ]);

  const days = Array.from({ length: 30 }, (_, i) => {
    const start = istMidnight(29 - i);
    const end = new Date(start.getTime() + 864e5);
    const inDay = monthOrders.filter((o) => o.createdAt >= start && o.createdAt < end);
    return { day: formatDate(start, { day: "numeric", month: "short" }), orders: inDay.length, revenue: inDay.reduce((t, o) => t + o.total, 0) };
  });
  const w = revWeek._sum.total ?? 0;
  const pw = revPrevWeek._sum.total ?? 0;
  const change = pw ? Math.round(((w - pw) / pw) * 100) : null;
  const top = topItems[0];

  return (
    <>
      {sp.denied ? <p className="mb-4 rounded-xl bg-[#f79009]/14 px-4 py-3 text-sm">That section needs a higher role. Ask the owner if you need access.</p> : null}
      <PageHeader
        title={`Hello, ${user.name.split(" ")[0]} 🍀`}
        description="Here's how the brewhouse is doing."
        actions={<><ALink href="/admin/orders?status=NEW" variant="primary">Open new orders</ALink><ALink href="/admin/c/flavours">Update stock</ALink></>}
      />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
        <Stat label="Orders today" value={ordersToday} hint={`${ordersWeek} this week`} />
        <Stat label="Revenue · 7 days" value={formatINR(w)} hint={change === null ? "No sales last week" : `${change >= 0 ? "▲" : "▼"} ${Math.abs(change)}% vs last week`} tone={change === null ? undefined : change >= 0 ? "up" : "down"} />
        <Stat label="Revenue · 30 days" value={formatINR(revMonth._sum.total ?? 0)} />
        <Stat label="Pending orders" value={pending} hint="New, confirmed or out" />
        <Stat label="New enquiries" value={newEnquiries} hint={`${waClicks} WhatsApp clicks · 7d`} />
        <Stat label="Top flavour · 30d" value={<span className="text-xl">{top?.name ?? "—"}</span>} hint={top ? `${top._sum.quantity ?? 0} bottles` : "No orders yet"} />
      </div>

      <div className="mt-6">
        <DashboardCharts days={days} flavours={topItems.map((t) => ({ name: t.name, bottles: t._sum.quantity ?? 0 }))} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <Card title="Recent orders" actions={<Link href="/admin/orders" className="text-sm text-a-accent hover:underline">All orders</Link>}>
          {recentOrders.length ? (
            <ul className="divide-y divide-a-line">
              {recentOrders.map((o) => (
                <li key={o.id}>
                  <Link href={`/admin/orders/${o.id}`} className="flex items-center gap-3 py-3 text-sm hover:opacity-80">
                    <span className="w-20 font-medium">{o.number}</span>
                    <span className="min-w-0 flex-1 truncate">{o.name} · {o.area}</span>
                    <CellView kind="badge" value={o.status} />
                    <span className="w-20 text-right tabular-nums">{formatINR(o.total)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : <p className="py-6 text-center text-sm text-a-muted">No orders yet — share the shop link on Instagram to get the first one.</p>}
        </Card>
        <Card title="Latest enquiries" actions={<Link href="/admin/c/enquiries" className="text-sm text-a-accent hover:underline">All enquiries</Link>}>
          {recentEnquiries.length ? (
            <ul className="divide-y divide-a-line">
              {recentEnquiries.map((e) => (
                <li key={e.id}>
                  <Link href={`/admin/c/enquiries/${e.id}`} className="flex items-center gap-3 py-3 text-sm hover:opacity-80">
                    <span className="min-w-0 flex-1"><span className="font-medium">{e.name}</span><span className="block truncate text-xs text-a-muted">{e.message}</span></span>
                    <CellView kind="badge" value={e.type} />
                    <CellView kind="badge" value={e.status} />
                  </Link>
                </li>
              ))}
            </ul>
          ) : <p className="py-6 text-center text-sm text-a-muted">No enquiries yet. They arrive from the For Business, Events and Contact forms.</p>}
        </Card>
      </div>

      <Card title="Quick actions" className="mt-6">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
          {[["/admin/c/flavours/new", "Add a flavour"], ["/admin/c/journal/new", "Write a post"], ["/admin/c/events/new", "Add an event"], ["/admin/media", "Upload photos"], ["/admin/pages", "Edit pages"], ["/admin/settings", "Announcement bar"]].map(([href, label]) => (
            <ALink key={href} href={href} className="h-12">{label}</ALink>
          ))}
        </div>
      </Card>
    </>
  );
}
