import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { InferModel } from 'drizzle-orm';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  name: text('name'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Types
export type User = InferModel<typeof users>; // for querying (select)
export type NewUser = InferModel<typeof users, 'insert'>; // for inserting
