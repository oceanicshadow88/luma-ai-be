import logger from '@src/utils/logger';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

// Load environment variables
dotenv.config({ path: '.env.test' });

// Set up global test timeout
jest.setTimeout(30000);

// Set up MongoDB Memory Server connection for testing
beforeAll(async () => {
  // Use a test configuration that doesn't touch your real database
  const MONGODB_TEST_URI = process.env.MONGODB_TEST_URI ?? 'mongodb://localhost:27017/luma-ai-test';

  try {
    await mongoose.connect(MONGODB_TEST_URI);
    logger.info('Connected to the test database');
  } catch (error) {
    logger.error('Error connecting to the test database:', error);
  }
});

// Clean up after tests
afterAll(async () => {
  // Drop the test database after all tests
  if (mongoose.connection.readyState) {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    logger.info('Test database connection closed');
  }
});
