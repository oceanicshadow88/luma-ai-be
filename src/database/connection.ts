import mongoose from 'mongoose';
import config from '../config';
import logger from '../utils/logger';

export const connectDB = () => {
  // Set a connection timeout
  const options = {
    serverSelectionTimeoutMS: 5000, // 5 seconds timeout
  };

  const db = mongoose.connection;
  db.on('connecting', () => {
    logger.info('Attempting to connect to DB');
  });
  db.on('connected', () => {
    logger.info('MongoDB connected successfully');
  });
  db.on('error', error => {
    logger.error('MongoDB connection error:', { payload: error });
    process.exit(0);
  });
  db.on('disconnected', () => {
    logger.info('MongoDB connection disconnected');
  });
  db.on('reconnected', () => {
    logger.info('MongoDB connection reconnected');
  });

  return mongoose.connect(config.mongoURI, options);
};
