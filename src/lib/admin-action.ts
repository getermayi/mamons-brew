import "server-only";
import { updateTag } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { ActionError, assertAdmin, type AdminUser } from "@/lib/session";
import type { Role } from "@/generated/prisma/enums";

export type ActionResult<T = null> = { ok: true; data: T; message?: string } | { ok: false; error: string; fieldErrors?: Record<string, string> };

/**
 * Wraps every admin mutation: checks the role, catches errors into a friendly
 * result, and expires the cache tags the change affects so the site updates instantly.
 */
export async function adminAction<T>(
  min: Role,
  run: (user: AdminUser) => Promise<{ data: T; tags?: string[]; audit?: { action: string; entity: string; entityId?: string; summary: string }; message?: string }>,
): Promise<ActionResult<T>> {
  try {
    const user = await assertAdmin(min);
    const result = await run(user);
    for (const tag of new Set(result.tags ?? [])) updateTag(tag);
    if (result.audit) {
      await db.auditLog.create({ data: { userId: user.id, ...result.audit } });
    }
    return { ok: true, data: result.data, message: result.message };
  } catch (e) {
    if (e instanceof z.ZodError) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of e.issues) fieldErrors[issue.path.join(".")] ??= issue.message;
      return { ok: false, error: "Some fields need attention.", fieldErrors };
    }
    if (e instanceof ActionError) return { ok: false, error: e.message };
    if (isUniqueViolation(e)) return { ok: false, error: "That slug, code or email is already in use." };
    console.error(e);
    return { ok: false, error: "Something went wrong while saving. Please try again." };
  }
}

function isUniqueViolation(e: unknown) {
  return typeof e === "object" && e !== null && "code" in e && (e as { code: unknown }).code === "P2002";
}
