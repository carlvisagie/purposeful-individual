import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./drizzle/schema-postgresql.ts",
  out: "./drizzle/migrations-postgresql",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
