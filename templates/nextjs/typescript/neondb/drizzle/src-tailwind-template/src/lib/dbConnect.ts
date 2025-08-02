import 'dotenv/config'; // if you use dotenv
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from '../../no-src-no-tailwind-template/schema/User'; // Adjust the path if needed

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('Please define the DATABASE_URL in your environment');
}

// 🚫 Disable prepare mode for compatibility with Neon
const client = postgres(connectionString, { prepare: false });

// ✅ Initialize Drizzle with schema
export const db = drizzle(client, { schema });
