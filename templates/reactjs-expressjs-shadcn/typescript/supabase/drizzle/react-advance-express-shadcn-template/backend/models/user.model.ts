import { pgTable, uuid, varchar, timestamp, index } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 50 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull().$onUpdate(() => new Date())
}, (table) => {
  return {
    emailIdx: index('idx_user_email').on(table.email),
    createdAtIdx: index('idx_user_created_at').on(table.createdAt)
  };
});

// Zod schemas for validation
export const insertUserSchema = createInsertSchema(users, {
  name: z.string().min(2).max(50),
  email: z.string().email().max(255)
});

export const selectUserSchema = createSelectSchema(users);
export const updateUserSchema = insertUserSchema.partial();

// Types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type UpdateUser = Partial<NewUser>;

export interface UserPublicProfile {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

// Helper function to get public profile
export const getUserPublicProfile = (user: User): UserPublicProfile => {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };
}; 