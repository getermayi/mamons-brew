import Link from "next/link";
import { notFound } from "next/navigation";
import { getCollection } from "@/admin/collections";
import { getItem, loadSources } from "@/app/admin/actions/collections";
import { Badge, Card, PageHeader } from "@/components/admin/ui";
import { db } from "@/lib/db";
import { can, requireAdmin } from "@/lib/session";
import { formatDate, formatINR, waLink } from "@/lib/utils";
import { CollectionEditor } from "./collection-editor";

export default async function EditItemPage({ params }: PageProps<"/admin/c/[collection]/[id]">) {
  const { collection, id } = await params;
  const def = getCollection(collection);
  if (!def) notFound();
  const user = await requireAdmin();
  const isNew = id === "new";
  if (isNew && !def.creatable) notFound();
  const [item, sources] = await Promise.all([isNew ? Promise.resolve(null) : getItem(collection, id), loadSources(def.sources ?? [])]);
  if (!isNew && !item) notFound();

  const title = isNew ? `New ${def.singular.toLowerCase()}` : String(item?.name ?? item?.title ?? item?.question ?? item?.email ?? item?.code ?? item?.alt ?? def.singular);
  const slug = typeof item?.slug === "string" ? item.slug : null;
  const phone = typeof item?.phone === "string" && item.phone ? item.phone : null;

  // Customers get their order history alongside the editor.
  const orders = collection === "customers" && !isNew ? await db.order.findMany({ where: { customerId: id }, orderBy: { createdAt: "desc" }, include: { items: true } }) : [];

  return (
    <>
      <PageHeader
        back={{ href: `/admin/c/${def.key}`, label: def.label }}
        title={title}
        actions={
          <>
            {phone ? <a href={waLink(phone, `Hi ${String(item?.name ?? "").split(" ")[0]}! This is Mamon Brews 🍀`)} target="_blank" rel="noopener noreferrer" className="inline-flex h-10 items-center rounded-xl bg-[#25D366] px-4 text-sm font-medium text-[#0b3d1f]">WhatsApp</a> : null}
            {def.viewPath && slug ? <Link href={def.viewPath.replace("{slug}", slug)} target="_blank" className="inline-flex h-10 items-center rounded-xl border border-a-line px-4 text-sm hover:bg-a-hover">View on site ↗</Link> : null}
          </>
        }
      />
      <div className={orders.length ? "grid gap-6 xl:grid-cols-[1fr_24rem]" : ""}>
        <CollectionEditor collection={def.key} id={isNew ? null : id} initial={item ?? def.newDefaults ?? {}} sources={sources} canEdit={can(user, "EDITOR")} />
        {orders.length ? (
          <Card title="Order history" description={`${orders.length} orders · ${formatINR(orders.filter((o) => o.status !== "CANCELLED").reduce((t, o) => t + o.total, 0))} lifetime`} className="self-start">
            <ul className="divide-y divide-a-line">
              {orders.map((o) => (
                <li key={o.id} className="py-3 text-sm">
                  <Link href={`/admin/orders/${o.id}`} className="flex items-center justify-between font-medium hover:underline">{o.number}<span className="tabular-nums">{formatINR(o.total)}</span></Link>
                  <p className="mt-1 flex items-center gap-2 text-xs text-a-muted">{formatDate(o.createdAt)} · {o.items.reduce((n, i) => n + i.quantity, 0)} items <Badge>{o.status.toLowerCase().replace(/_/g, " ")}</Badge></p>
                </li>
              ))}
            </ul>
          </Card>
        ) : null}
      </div>
    </>
  );
}
