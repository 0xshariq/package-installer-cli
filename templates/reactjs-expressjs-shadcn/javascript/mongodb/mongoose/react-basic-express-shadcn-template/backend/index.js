import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import userRoutes from './routes/user.routes.js';

dotenv.config({ path: '.env' });  // Create a .env file in the root directory and add your MongoDB URI

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/basic-express';

// CORS configuration for frontend connection
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173', // Vite default port
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use('/api/users', userRoutes);

app.get('/', (req, res) => {
  res.send('Hello from Basic Express JavaScript!');
});


mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB using Mongoose ORM');
    app.listen(PORT, () => {
      console.log('🚀 Express backend is running!');
      console.log(`Server is running on port ${PORT}`);
      console.log(`Frontend can connect from: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
      console.log('ℹ️ This template uses MongoDB (database) and Mongoose (ORM) for data modeling.');
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
    console.log('⚠️ Please check your MongoDB URI and ensure the database server is running.');
  });