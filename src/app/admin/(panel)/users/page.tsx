import { PageHeader } from "@/components/admin/ui";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { UsersManager } from "./users-manager";

export default async function UsersPage() {
  const me = await requireAdmin("OWNER");
  const users = await db.user.findMany({ orderBy: [{ role: "asc" }, { name: "asc" }] });
  return (
    <>
      <PageHeader title="Users & roles" description="Owner: everything. Editor: content, catalogue and orders. Viewer: can look but not change." />
      <UsersManager meId={me.id} users={users.map((u) => ({ id: u.id, name: u.name, email: u.email, role: u.role, active: u.active, lastLoginAt: u.lastLoginAt?.toISOString() ?? null }))} />
    </>
  );
}
