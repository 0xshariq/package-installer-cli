import { DataSource } from 'typeorm';
import { User } from './entities/User.js';

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'ep-xxxx.neon.tech', // Replace with your Neon host
  port: parseInt(process.env.DB_PORT) || 5432,
  username: process.env.DB_USERNAME || 'your_neon_username',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'your_neon_dbname',
  ssl: true, // 🔐 Required by Neon
  synchronize: process.env.NODE_ENV === 'development',
  logging: process.env.NODE_ENV === 'development',
  entities: [User],
  subscribers: [],
  migrations: [],
});

export default AppDataSource;
