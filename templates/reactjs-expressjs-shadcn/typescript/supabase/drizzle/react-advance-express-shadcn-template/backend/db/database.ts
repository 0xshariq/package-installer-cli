import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../models/user.model.js';

if (!process.env.SUPABASE_DATABASE_URL) {
  throw new Error('SUPABASE_DATABASE_URL is not defined in environment variables');
}

// Create the connection
const connectionString = process.env.SUPABASE_DATABASE_URL;
const client = postgres(connectionString, {
  ssl: 'require',
  max: 1,
  onnotice: process.env.NODE_ENV === 'development' ? console.log : () => {}
});

// Create the database instance
export const db = drizzle(client, { schema });

const connectDB = async (): Promise<void> => {
  try {
    // Test the connection
    await db.execute('SELECT 1' as any);
    console.log('✅ Supabase PostgreSQL connected successfully with Drizzle');
    
    // Graceful shutdown
    process.on('SIGINT', async () => {
      await client.end();
      console.log('Database connection closed through app termination');
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      await client.end();
      console.log('Database connection closed through app termination');
      process.exit(0);
    });

  } catch (error) {
    console.error('❌ Database connection error:', error);
    await client.end();
    process.exit(1);
  }
};

export default connectDB; 