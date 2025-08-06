import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: process.env.NEONDB_DATABASE_URL
      }
    }
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

const connectDB = async (): Promise<void> => {
  try {
    await prisma.$connect();
    console.log('✅ NeonDB PostgreSQL connected successfully with Prisma');
    
    // Test the connection
    await prisma.$queryRaw`SELECT 1`;
    
    // Graceful shutdown
    process.on('SIGINT', async () => {
      await prisma.$disconnect();
      console.log('Database connection closed through app termination');
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      await prisma.$disconnect();
      console.log('Database connection closed through app termination');
      process.exit(0);
    });

  } catch (error) {
    console.error('❌ Database connection error:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
};

export default connectDB;