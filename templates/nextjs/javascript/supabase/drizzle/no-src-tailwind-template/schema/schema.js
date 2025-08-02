import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

// Example schema - modify according to your needs
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  name: text('name'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}); 