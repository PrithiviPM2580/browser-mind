import "dotenv/config";
import { defineConfig } from "drizzle-kit";

const migrationUrl =
  process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL;

if (!migrationUrl) {
  throw new Error(
    "DATABASE_URL_UNPOOLED (or DATABASE_URL) is not set in .env.local",
  );
}

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./src/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: migrationUrl,
  },
  casing: "snake_case",
  verbose: true,
  strict: true,
});
