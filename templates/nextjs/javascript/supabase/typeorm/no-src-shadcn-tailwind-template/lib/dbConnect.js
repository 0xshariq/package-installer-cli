import { DataSource } from 'typeorm';
import { User } from './entities/User.js';

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'db.supabase.co',
  port: parseInt(process.env.DB_PORT) || 5432,
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'postgres',
  synchronize: process.env.NODE_ENV === 'development',
  logging: process.env.NODE_ENV === 'development',
  entities: [User],
  subscribers: [],
  migrations: [],
});

export default AppDataSource; 