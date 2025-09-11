import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "mysql2";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,
});

export const db = drizzle(pool);
