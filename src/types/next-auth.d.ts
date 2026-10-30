import type { UserRole, UserStatus } from "@prisma/client";
import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: UserRole;
      status: UserStatus;
    };
  }

  interface User {
    id: string;
    role?: UserRole;
    status?: UserStatus;
  }
}
