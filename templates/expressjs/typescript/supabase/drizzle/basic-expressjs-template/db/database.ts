import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema.js';

if (!process.env.SUPABASE_DB_URL) {
  throw new Error('SUPABASE_DB_URL is not defined in environment variables');
}

const client = postgres(process.env.SUPABASE_DB_URL);
export const db = drizzle(client, { schema });

export const connectDB = async (): Promise<void> => {
  try {
    // Test the connection
    await client`SELECT 1`;
    console.log('✅ Supabase Database Connected Successfully with Drizzle');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
};
