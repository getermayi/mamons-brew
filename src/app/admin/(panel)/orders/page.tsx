import { PageHeader } from "@/components/admin/ui";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { OrdersTable } from "./orders-table";

export default async function OrdersPage({ searchParams }: PageProps<"/admin/orders">) {
  await requireAdmin();
  const sp = await searchParams;
  const orders = await db.order.findMany({ orderBy: { createdAt: "desc" }, take: 3000, include: { items: { select: { quantity: true } } } });
  return (
    <>
      <PageHeader title="Orders" description="Every checkout is saved here before WhatsApp opens. Move orders along the pipeline as you confirm and deliver them." />
      <OrdersTable
        initialStatus={typeof sp.status === "string" ? sp.status : ""}
        orders={orders.map((o) => ({
          id: o.id, number: o.number, name: o.name, phone: o.phone, area: o.area, fulfilment: o.fulfilment, status: o.status, paymentStatus: o.paymentStatus, paymentMethod: o.paymentMethod,
          total: o.total, bottles: o.items.reduce((n, i) => n + i.quantity, 0), createdAt: o.createdAt.toISOString(), preferredDate: o.preferredDate ?? "",
        }))}
      />
    </>
  );
}
