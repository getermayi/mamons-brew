"use server";

import { AuthError } from "next-auth";
import { signIn, signOut } from "@/auth";
import { loginSchema } from "@/lib/schemas";

export async function login(input: unknown): Promise<{ ok: false; error: string } | { ok: true }> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Enter your email and password." };
  try {
    await signIn("credentials", { ...parsed.data, redirect: false });
    return { ok: true };
  } catch (e) {
    if (e instanceof AuthError) {
      const code = (e as AuthError & { code?: string }).code;
      if (code === "rate_limited") return { ok: false, error: "Too many attempts. Please wait 15 minutes and try again." };
      return { ok: false, error: "That email and password don't match." };
    }
    throw e;
  }
}

export async function logout() {
  await signOut({ redirectTo: "/admin/login" });
}
