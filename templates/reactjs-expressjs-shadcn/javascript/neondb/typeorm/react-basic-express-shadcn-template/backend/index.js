
import express from 'express';
import { AppDataSource } from './db/connection.js';
import { User } from './models/User.js';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config({ path: '.env' });

const app = express();
const PORT = process.env.PORT || 3000;

// CORS configuration for frontend connection
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Add User entity to AppDataSource
AppDataSource.options.entities = [User];

app.get('/', (req, res) => {
  res.send('Hello from Basic Express JavaScript + TypeORM + PostgreSQL!');
});

app.post('/api/users', async (req, res) => {
  const { name, email } = req.body;
  try {
    const userRepo = AppDataSource.getRepository(User);
    const user = userRepo.create({ name, email });
    await userRepo.save(user);
    res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/users', async (req, res) => {
  try {
    const userRepo = AppDataSource.getRepository(User);
    const users = await userRepo.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

AppDataSource.initialize()
  .then(() => {
    console.log('✅ Connected to PostgreSQL using TypeORM');
    app.listen(PORT, () => {
      console.log('🚀 Express backend is running!');
      console.log(`Server is running on port ${PORT}`);
      console.log(`Frontend can connect from: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
      console.log('ℹ️ This template uses PostgreSQL (database) and TypeORM (ORM) for data modeling.');
    });
  })
  .catch((err) => {
    console.error('❌ PostgreSQL connection error:', err);
    console.log('⚠️ Please check your DATABASE_URL and ensure the database server is running.');
  });