import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // CORS configuration for frontend connection
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173', // Vite default port
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  });
  
  await app.listen(process.env.PORT ?? 3000);
  console.log(`🚀 NestJS server running on port ${process.env.PORT ?? 3000}`);
  console.log(`📱 Frontend can connect from: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
}
bootstrap();
