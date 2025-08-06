import { DataSource } from 'typeorm';
import { User } from '../models/user.model.js';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.NEON_DB_HOST,
  port: parseInt(process.env.NEON_DB_PORT) || 5432,
  username: process.env.NEON_DB_USER,
  password: process.env.NEON_DB_PASSWORD,
  database: process.env.NEON_DB_NAME,
  ssl: {
    rejectUnauthorized: false
  },
  entities: [User],
  synchronize: process.env.NODE_ENV === 'development',
  logging: process.env.NODE_ENV === 'development'
});

export const connectDB = async () => {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      console.log('✅ NeonDB Database Connected Successfully');
    }
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
};
