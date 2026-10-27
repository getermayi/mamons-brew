import { PageHeader } from "@/components/admin/ui";
import { db } from "@/lib/db";
import { can, requireAdmin } from "@/lib/session";
import { NavEditor } from "./nav-editor";

async function tree(key: string) {
  const menu = await db.navigationMenu.findUnique({ where: { key }, include: { items: { orderBy: { order: "asc" } } } });
  const items = menu?.items ?? [];
  return items.filter((i) => !i.parentId).map((i) => ({ label: i.label, href: i.href, children: items.filter((c) => c.parentId === i.id).map((c) => ({ label: c.label, href: c.href })) }));
}

export default async function NavigationPage() {
  const user = await requireAdmin();
  const [header, footer] = await Promise.all([tree("header"), tree("footer")]);
  return (
    <>
      <PageHeader title="Menus" description="The header menu (with dropdowns) and the footer columns. Drag to reorder; add links inside an item to make a dropdown." />
      <NavEditor header={header} footer={footer} canEdit={can(user, "EDITOR")} />
    </>
  );
}
