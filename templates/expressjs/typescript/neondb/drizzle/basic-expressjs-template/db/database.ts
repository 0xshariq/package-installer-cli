import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from './schema.js';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not defined in environment variables');
}

const sql = neon(process.env.DATABASE_URL);
export const db = drizzle(sql, { schema });

export const connectDB = async (): Promise<void> => {
  try {
    // Test the connection
    await sql`SELECT 1`;
    console.log('✅ NeonDB Database Connected Successfully with Drizzle');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
};
