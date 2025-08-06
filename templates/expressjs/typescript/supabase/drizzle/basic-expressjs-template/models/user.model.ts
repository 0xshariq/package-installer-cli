import { eq } from 'drizzle-orm';
import { db } from '../db/database.js';
import { users, type User, type NewUser } from '../db/schema.js';

export interface CreateUserData {
  name: string;
  email: string;
}

export class UserService {
  static async createUser(data: CreateUserData): Promise<User> {
    const [user] = await db.insert(users).values({
      name: data.name,
      email: data.email.toLowerCase(),
    }).returning();
    return user;
  }

  static async findUserById(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  static async findUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email.toLowerCase()));
    return user;
  }

  static async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }
} 