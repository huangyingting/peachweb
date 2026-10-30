import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  prismaUrl: string | undefined;
};

export function createPrismaClient(databaseUrl = process.env.DATABASE_URL ?? "file:./dev.db") {
  if (databaseUrl.startsWith("postgres://") || databaseUrl.startsWith("postgresql://")) {
    const adapter = new PrismaPg({ connectionString: databaseUrl });
    return new PrismaClient({ adapter });
  }

  const adapter = new PrismaBetterSqlite3({ url: databaseUrl });
  return new PrismaClient({ adapter });
}

const currentUrl = process.env.DATABASE_URL ?? "file:./dev.db";

export const prisma =
  globalForPrisma.prisma && globalForPrisma.prismaUrl === currentUrl
    ? globalForPrisma.prisma
    : createPrismaClient(currentUrl);

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
  globalForPrisma.prismaUrl = currentUrl;
}
