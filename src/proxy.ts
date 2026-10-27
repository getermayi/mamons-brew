import NextAuth from "next-auth";
import { NextResponse, type NextRequest } from "next/server";
import { authConfig } from "@/auth.config";

const { auth } = NextAuth(authConfig);

const guard = auth((req) => {
  const isLogin = req.nextUrl.pathname.startsWith("/admin/login");
  if (!req.auth && !isLogin) return NextResponse.redirect(new URL("/admin/login", req.nextUrl));
  if (req.auth && isLogin) return NextResponse.redirect(new URL("/admin", req.nextUrl));
  return NextResponse.next();
});

// Optimistic gate for /admin. Every admin page and action re-checks the user against the database.
export default function proxy(request: NextRequest) {
  return guard(request, { params: Promise.resolve({}) });
}

export const config = {
  matcher: ["/admin/:path*"],
};
