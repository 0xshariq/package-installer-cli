// Prisma types are generated automatically from schema.prisma
// This file contains additional type definitions and utilities

export interface CreateUserInput {
  name: string;
  email: string;
}

export interface UpdateUserInput {
  name?: string;
  email?: string;
}

export interface UserPublicProfile {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

// Helper function to get public profile from user object
export const getUserPublicProfile = (user: any): UserPublicProfile => {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };
}; 