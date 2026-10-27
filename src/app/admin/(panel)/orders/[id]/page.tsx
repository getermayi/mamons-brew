import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge, Card, PageHeader } from "@/components/admin/ui";
import { db } from "@/lib/db";
import { can, requireAdmin } from "@/lib/session";
import { formatDate, formatINR, waLink } from "@/lib/utils";
import { OrderControls, OrderNotes } from "./order-controls";

export default async function OrderPage({ params }: PageProps<"/admin/orders/[id]">) {
  const { id } = await params;
  const user = await requireAdmin();
  const o = await db.order.findUnique({ where: { id }, include: { items: true, customer: { include: { _count: { select: { orders: true } } } } } });
  if (!o) notFound();
  const first = o.name.split(" ")[0];
  const message = {
    NEW: `Hi ${first}! Thanks for your Mamon Brews order ${o.number} 🍀 Confirming ${o.fulfilment === "PICKUP" ? "pickup" : `delivery to ${o.area}`} — total ${formatINR(o.total)}. Does ${o.preferredDate || "today/tomorrow"} work for you?`,
    CONFIRMED: `Hi ${first}! Your order ${o.number} is confirmed 🍀 We'll let you know when it's on the way.`,
    OUT_FOR_DELIVERY: `Hi ${first}! Your Mamon Brews order ${o.number} is out for delivery 🛵 Please keep it in the fridge as soon as it arrives.`,
    DELIVERED: `Hi ${first}! Hope you're enjoying your kombucha 🍀 Remember to rinse and return the bottles with your next order.`,
    CANCELLED: `Hi ${first}, about your Mamon Brews order ${o.number}:`,
  }[o.status];

  return (
    <>
      <PageHeader
        back={{ href: "/admin/orders", label: "Orders" }}
        title={<span className="flex items-center gap-3">{o.number} <Badge tone={o.paymentStatus === "PAID" ? "green" : "amber"}>{o.paymentStatus === "PAID" ? "Paid" : o.paymentMethod === "RAZORPAY" ? "Online · unpaid" : "Pay on WhatsApp"}</Badge></span>}
        description={`Placed ${formatDate(o.createdAt, { weekday: "short", day: "numeric", month: "long", hour: "numeric", minute: "2-digit" })}`}
        actions={
          <>
            <a href={waLink(o.phone, message)} target="_blank" rel="noopener noreferrer" className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#25D366] px-4 text-sm font-medium text-[#0b3d1f]">Message on WhatsApp</a>
            <Link href={`/admin/orders/${o.id}/invoice`} target="_blank" className="inline-flex h-10 items-center rounded-xl border border-a-line px-4 text-sm hover:bg-a-hover">Print invoice</Link>
          </>
        }
      />
      <div className="grid gap-6 xl:grid-cols-[1fr_22rem]">
        <div className="space-y-6">
          <OrderControls id={o.id} status={o.status} paymentStatus={o.paymentStatus} canEdit={can(user, "EDITOR")} />
          <Card title="Items">
            <ul className="divide-y divide-a-line">
              {o.items.map((i) => (
                <li key={i.id} className="flex items-center justify-between gap-4 py-3 text-sm">
                  <span><span className="font-medium">{i.quantity} × {i.name}</span>{i.variantLabel ? <span className="text-a-muted"> · {i.variantLabel}</span> : null}</span>
                  <span className="tabular-nums">{formatINR(i.unitPrice * i.quantity)}</span>
                </li>
              ))}
            </ul>
            <dl className="mt-4 space-y-1.5 border-t border-a-line pt-4 text-sm">
              <div className="flex justify-between"><dt className="text-a-muted">Subtotal</dt><dd className="tabular-nums">{formatINR(o.subtotal)}</dd></div>
              {o.discount ? <div className="flex justify-between"><dt className="text-a-muted">Discount {o.discountCode ? `(${o.discountCode})` : ""}</dt><dd className="tabular-nums">−{formatINR(o.discount)}</dd></div> : null}
              <div className="flex justify-between"><dt className="text-a-muted">{o.fulfilment === "PICKUP" ? "Pickup" : "Delivery"}</dt><dd className="tabular-nums">{o.deliveryFee ? formatINR(o.deliveryFee) : "Free"}</dd></div>
              <div className="flex justify-between pt-2 text-base font-semibold"><dt>Total</dt><dd className="tabular-nums">{formatINR(o.total)}</dd></div>
            </dl>
          </Card>
          <OrderNotes id={o.id} notes={o.internalNotes ?? ""} canEdit={can(user, "EDITOR")} />
        </div>
        <div className="space-y-6">
          <Card title="Customer">
            <p className="font-medium"><Link href={`/admin/c/customers/${o.customerId}`} className="hover:underline">{o.name}</Link></p>
            <p className="text-sm text-a-muted">{o.customer._count.orders} order{o.customer._count.orders === 1 ? "" : "s"} in total</p>
            <dl className="mt-4 space-y-2 text-sm">
              <div><dt className="text-xs text-a-muted">Phone</dt><dd><a href={`tel:${o.phone}`} className="hover:underline">{o.phone}</a></dd></div>
              {o.email ? <div><dt className="text-xs text-a-muted">Email</dt><dd>{o.email}</dd></div> : null}
              <div><dt className="text-xs text-a-muted">{o.fulfilment === "PICKUP" ? "Pickup" : "Delivery"}</dt><dd>{o.area}{o.address ? <><br />{o.address}</> : null}</dd></div>
              <div><dt className="text-xs text-a-muted">Preferred</dt><dd>{[o.preferredDate, o.preferredTime].filter(Boolean).join(" · ") || "Any time"}</dd></div>
              {o.notes ? <div><dt className="text-xs text-a-muted">Customer note</dt><dd className="whitespace-pre-line">{o.notes}</dd></div> : null}
            </dl>
            {o.address ? <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${o.address}, ${o.area}`)}`} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex text-sm text-a-accent hover:underline">Open in Google Maps ↗</a> : null}
          </Card>
          {o.razorpayPaymentId ? <Card title="Payment"><p className="break-all text-sm">Razorpay payment {o.razorpayPaymentId}</p></Card> : null}
        </div>
      </div>
    </>
  );
}
