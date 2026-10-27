import "server-only";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import type { Role } from "@/generated/prisma/enums";

const rank: Record<Role, number> = { VIEWER: 0, EDITOR: 1, OWNER: 2 };

export type AdminUser = { id: string; name: string; email: string; role: Role };

/** Data Access Layer: the session cookie is only a hint — the database decides. */
export async function getAdminUser(): Promise<AdminUser | null> {
  const session = await auth();
  if (!session?.user?.id) return null;
  const user = await db.user.findUnique({ where: { id: session.user.id }, select: { id: true, name: true, email: true, role: true, active: true } });
  if (!user || !user.active) return null;
  return { id: user.id, name: user.name, email: user.email, role: user.role };
}

export async function requireAdmin(min: Role = "VIEWER"): Promise<AdminUser> {
  const user = await getAdminUser();
  if (!user) redirect("/admin/login");
  if (rank[user.role] < rank[min]) redirect("/admin?denied=1");
  return user;
}

export function can(user: Pick<AdminUser, "role">, min: Role) {
  return rank[user.role] >= rank[min];
}

export class ActionError extends Error {}

/** For server actions: throws instead of redirecting. */
export async function assertAdmin(min: Role = "EDITOR"): Promise<AdminUser> {
  const user = await getAdminUser();
  if (!user) throw new ActionError("Your session has ended — please sign in again.");
  if (rank[user.role] < rank[min]) throw new ActionError(min === "OWNER" ? "Only the owner can do that." : "You have view-only access.");
  return user;
}
