import dotenv from 'dotenv';
import { connectDB } from '../src/database/connection';
import app from './app';

// Load environment variables
dotenv.config();

const port = process.env.PORT || 5000;

// Start server
const startServer = async () => {
  try {
    // Connect to MongoDB
    console.log('Attempting to connect to MongoDB...');
    await connectDB();
    console.log('Database connection established');

    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
