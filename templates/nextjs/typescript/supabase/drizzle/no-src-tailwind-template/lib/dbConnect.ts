import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../schema/User'; // Adjust the path

const connectionString = process.env.SUPABASE_DB_URL;

if (!connectionString) {
  throw new Error('Please define SUPABASE_DB_URL in your .env file');
}

// Disable prepare mode for Supabase (and Neon, which it uses)
const client = postgres(connectionString, { prepare: false });

export const db = drizzle(client, { schema });
