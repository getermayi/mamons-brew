import type { DefaultSession } from "next-auth";

type AppRole = "OWNER" | "EDITOR" | "VIEWER";

declare module "next-auth" {
  interface User {
    role?: AppRole;
  }
  interface Session {
    user: { id: string; role: AppRole } & DefaultSession["user"];
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    uid?: string;
    role?: AppRole;
  }
}
