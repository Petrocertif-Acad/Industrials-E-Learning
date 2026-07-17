import type { Locale, UserRole } from "@/lib/generated/prisma/enums";

declare module "next-auth" {
  interface User {
    role: UserRole;
    locale: Locale;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      role: UserRole;
      locale: Locale;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: UserRole;
    locale: Locale;
  }
}
