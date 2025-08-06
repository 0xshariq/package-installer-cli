import { getModelForClass, mongoose } from '@typegoose/typegoose';

export const connectDB = async (): Promise<void> => {
  const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/basic-express';
  try {
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB using Typegoose');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};
