import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.warn("DATABASE_URL environment variable is not defined. Database queries will fail without a connection string.");
}

const pool = new pg.Pool({
  connectionString: connectionString || "postgres://localhost:5432/postgres",
  ssl: connectionString && (connectionString.includes("neon.tech") || !connectionString.includes("localhost"))
    ? { rejectUnauthorized: false }
    : false,
});

export const db = drizzle(pool, { schema });

export * from "./schema";
