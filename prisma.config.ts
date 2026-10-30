import { defineConfig } from "prisma/config";

const schemaFile = process.env.PRISMA_SCHEMA_FILE ?? "prisma/schema.prisma";
const databaseUrl = process.env.DATABASE_URL ?? "file:./dev.db";

export default defineConfig({
  schema: schemaFile,
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: databaseUrl,
  },
});
