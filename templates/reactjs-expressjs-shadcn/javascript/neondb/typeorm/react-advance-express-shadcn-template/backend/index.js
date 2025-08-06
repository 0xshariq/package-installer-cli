import express from 'express';
import dotenv from 'dotenv';
import { AppDataSource } from './db/connection.js';
import { User } from './models/User.js';
import routes from './routes/index.js';
import { setupSecurityMiddleware } from './middleware/security.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

// Load environment variables
dotenv.config({ path: '.env' });  // Create a .env file in the root directory and add your MongoDB URI

const app = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Add User entity to AppDataSource
AppDataSource.options.entities = [User];
AppDataSource.initialize()
  .then(() => {
    console.log('✅ Connected to Postgres using TypeORM');
  })
  .catch((err) => {
    console.error('❌ Postgres connection error:', err);
    console.log('⚠️ Please check your Postgres URI and ensure the database server is running.');
  });

// Setup security middleware
setupSecurityMiddleware(app);

// Welcome route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to Express JavaScript API',
    version: '1.0.0',
    environment: NODE_ENV,
    documentation: '/api/v1/docs'
  });
});

// API routes
app.use('/', routes);

// 404 handler
app.use(notFound);

// Error handling middleware (must be last)
app.use(errorHandler);

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running in ${NODE_ENV} mode on port ${PORT}`);
  console.log(`📱 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 API Base URL: http://localhost:${PORT}/api/v1`);
});

export default app; 