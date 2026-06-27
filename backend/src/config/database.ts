import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/daamcheck';

export async function connectDB(): Promise<void> {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB connected — daamcheck');
  } catch (err) {
    console.error('MongoDB connection failed:', err);
    process.exit(1);
  }
}
