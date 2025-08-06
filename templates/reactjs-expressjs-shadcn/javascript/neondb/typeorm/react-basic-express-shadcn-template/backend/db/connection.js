import { DataSource } from 'typeorm';
import dotenv from 'dotenv';
dotenv.config({ path: '.env' });

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL || 'postgres://postgres:password@localhost:5432/basic_express',
  synchronize: true,
  logging: false,
  entities: [], // Add entities in index.js
});
