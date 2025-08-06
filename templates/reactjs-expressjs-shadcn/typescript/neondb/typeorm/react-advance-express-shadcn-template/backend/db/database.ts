
import { DataSource } from 'typeorm';

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL || 'postgres://postgres:password@localhost:5432/neondb_advance_express',
  synchronize: true,
  logging: false,
  entities: [], // Entities will be added in index.ts
});