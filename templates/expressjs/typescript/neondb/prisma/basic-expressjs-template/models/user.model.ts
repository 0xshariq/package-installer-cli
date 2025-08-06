// Basic user operations with Prisma
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface CreateUserData {
  name: string;
  email: string;
}

export class UserService {
  static async createUser(data: CreateUserData) {
    return await prisma.user.create({
      data: {
        name: data.name,
        email: data.email.toLowerCase(),
      },
    });
  }

  static async findUserById(id: string) {
    return await prisma.user.findUnique({
      where: { id },
    });
  }

  static async findUserByEmail(email: string) {
    return await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
  }

  static async getAllUsers() {
    return await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }
} 