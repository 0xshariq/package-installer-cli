import { DataSource } from 'typeorm';
import { User } from '../models/user.model.js';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.SUPABASE_DB_HOST,
  port: parseInt(process.env.SUPABASE_DB_PORT) || 5432,
  username: process.env.SUPABASE_DB_USER,
  password: process.env.SUPABASE_DB_PASSWORD,
  database: process.env.SUPABASE_DB_NAME,
  ssl: {
    rejectUnauthorized: false
  },
  entities: [User],
  synchronize: process.env.NODE_ENV === 'development',
  logging: process.env.NODE_ENV === 'development',
  migrations: ['src/migrations/*.js'],
  subscribers: ['src/subscribers/*.js']
});

export const connectDB = async () => {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      console.log('✅ Supabase Database Connected Successfully');
    }
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
};

export const disconnectDB = async () => {
  try {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log('📦 Database connection closed');
    }
  } catch (error) {
    console.error('Error closing database connection:', error);
  } 