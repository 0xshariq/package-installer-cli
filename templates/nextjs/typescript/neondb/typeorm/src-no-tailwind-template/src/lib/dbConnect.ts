import 'dotenv/config'; // Load env vars from .env
import { DataSource } from 'typeorm';
import { User } from './entities/User'; // Adjust path if needed

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'ep-xxxxx.neon.tech',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'your_neon_username',
  password: process.env.DB_PASSWORD || 'your_neon_password',
  database: process.env.DB_NAME || 'your_neon_dbname',
  ssl: true, // Neon requires SSL
  synchronize: process.env.NODE_ENV === 'development',
  logging: process.env.NODE_ENV === 'development',
  entities: [User],
  migrations: [],
  subscribers: [],
});

export default AppDataSource;
