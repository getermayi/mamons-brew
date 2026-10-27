import type { NextAuthConfig } from "next-auth";

/** Shared, dependency-light config — used by the proxy for the optimistic /admin check. */
export const authConfig = {
  pages: { signIn: "/admin/login" },
  session: { strategy: "jwt", maxAge: 60 * 60 * 12 },
  trustHost: true,
  providers: [],
  callbacks: {
    authorized({ auth, request }) {
      const isLogin = request.nextUrl.pathname.startsWith("/admin/login");
      if (isLogin) return true;
      return Boolean(auth?.user);
    },
    jwt({ token, user }) {
      if (user) {
        token.uid = user.id;
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }) {
      if (token.uid) session.user.id = token.uid;
      if (token.role) session.user.role = token.role;
      return session;
    },
  },
} satisfies NextAuthConfig;
