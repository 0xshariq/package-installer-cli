import { DataSource } from 'typeorm';
import { User } from '../models/user.model.js';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.SUPABASE_HOST,
  port: parseInt(process.env.SUPABASE_PORT || '5432'),
  username: process.env.SUPABASE_USER,
  password: process.env.SUPABASE_PASSWORD,
  database: process.env.SUPABASE_DATABASE,
  ssl: {
    rejectUnauthorized: false
  },
  synchronize: process.env.NODE_ENV === 'development', // Only in development
  logging: process.env.NODE_ENV === 'development',
  entities: [User],
  migrations: ['dist/migrations/*.js'],
  migrationsTableName: 'migrations'
});

const connectDB = async (): Promise<void> => {
  try {
    await AppDataSource.initialize();
    console.log('✅ Supabase PostgreSQL connected successfully with TypeORM');
    
    // Graceful shutdown
    process.on('SIGINT', async () => {
      if (AppDataSource.isInitialized) {
        await AppDataSource.destroy();
        console.log('Database connection closed through app termination');
      }
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      if (AppDataSource.isInitialized) {
        await AppDataSource.destroy();
        console.log('Database connection closed through app termination');
      }
      process.exit(0);
    });

  } catch (error) {
    console.error('❌ Database connection error:', error);
    process.exit(1);
  }
};

export default connectDB; 