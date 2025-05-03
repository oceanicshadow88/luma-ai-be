import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/luma-ai';

export const connectDB = async () => {
  try {
    // Set a connection timeout
    const options = {
      serverSelectionTimeoutMS: 5000, // 5 seconds timeout
    };

    await mongoose.connect(MONGODB_URI, options);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    console.log('Starting server without database connection...');
    // Continue without exiting, allowing API to run even if DB is unavailable
    // process.exit(1); - commented out to prevent termination
  }
};
