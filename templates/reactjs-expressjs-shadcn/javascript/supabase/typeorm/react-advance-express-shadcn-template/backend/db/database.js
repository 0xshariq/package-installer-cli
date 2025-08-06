import { DataSource } from 'typeorm';

const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL || 'postgres://postgres:password@localhost:5432/supabase_advance_express',
  synchronize: true,
  logging: false,
  entities: [], // Entities will be added in index.js
});

export { AppDataSource };