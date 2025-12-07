import { defineConfig } from "drizzle-kit";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is required to run drizzle commands");
}

export default defineConfig({
  schema: "./drizzle/index.ts", // Updated to use unified schema index
  out: "./drizzle/migrations",
  dialect: "mysql",
  dbCredentials: {
    url: connectionString,
  },
});
