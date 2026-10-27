import bcrypt from "bcryptjs";
import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "@/auth.config";
import { db } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";
import { loginSchema } from "@/lib/schemas";

class TooManyAttempts extends CredentialsSignin {
  code = "rate_limited";
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      async authorize(raw, request) {
        const parsed = loginSchema.safeParse(raw);
        if (!parsed.success) return null;
        const email = parsed.data.email.toLowerCase();
        const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";

        // 5 tries per email+IP every 15 minutes, 20 per IP overall.
        const allowed = (await rateLimit(`login:${email}:${ip}`, 5, 15 * 60)) && (await rateLimit(`login-ip:${ip}`, 20, 15 * 60));
        if (!allowed) throw new TooManyAttempts();

        const user = await db.user.findUnique({ where: { email } });
        // Compare against a dummy hash when the user doesn't exist, so timing doesn't leak accounts.
        const ok = await bcrypt.compare(parsed.data.password, user?.passwordHash ?? "$2b$12$spShSsPtRJfqTsMtNHIBgez8p0hF63Op3NV0hHbXiQ3wo2H0uyRXC");
        if (!user || !ok || !user.active) return null;

        await db.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
        await db.auditLog.create({ data: { userId: user.id, action: "login", entity: "User", entityId: user.id, summary: `${user.name} signed in` } });
        return { id: user.id, name: user.name, email: user.email, role: user.role };
      },
    }),
  ],
});
