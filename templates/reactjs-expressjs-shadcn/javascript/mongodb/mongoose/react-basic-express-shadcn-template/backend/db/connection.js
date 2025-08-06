import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: '.env' });

export function connectDB() {
  const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/basic-express';
  return mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
}
