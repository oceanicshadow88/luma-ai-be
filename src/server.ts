import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { connectDB } from './database/connection';
import { errorHandler } from './middleware/errorHandler';
import apiRoutes from './routes';

console.log('Starting server initialization...');

// Load environment variables
dotenv.config();
console.log('Environment variables loaded');

// Create Express app
const app: Express = express();
const port = process.env.PORT || 5000;
console.log(`Port set to: ${port}`);

try {
  // Middleware
  console.log('Setting up middleware...');
  app.use(cors());
  app.use(helmet());
  app.use(morgan('dev'));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  console.log('Middleware setup complete');

  // Routes
  console.log('Setting up routes...');
  app.use('/api', apiRoutes);
  console.log('Routes setup complete');

  // Error Handling
  console.log('Setting up error handler...');
  app.use(errorHandler);
  console.log('Error handler setup complete');

  // Start server
  console.log('Attempting to start server...');
  const startServer = async () => {
    try {
      // Connect to MongoDB
      console.log('Attempting to connect to MongoDB...');
      await connectDB();
      console.log('Database connection handling complete');

      app.listen(port, () => {
        console.log(`Server running on port ${port}`);
      });
    } catch (error) {
      console.error('Failed to start server:', error);
      process.exit(1);
    }
  };

  startServer();
} catch (error) {
  console.error('Error during server initialization:', error);
}
