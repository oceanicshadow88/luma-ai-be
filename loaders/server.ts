import app from '@loaders/app';
import config from '@src/config';
import { connectDB } from '@src/database/connection';
import logger from '@src/utils/logger';

const port = config.port || 8000;

// Start server
const startServer = async () => {
  try {
    // Connect to MongoDB
    logger.info('Attempting to connect to MongoDB...');
    await connectDB();
    logger.info('Database connection established');

    app.listen(port, () => {
      logger.info(`Server running on port:${port}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', { payload: error });
    process.exit(1);
  }
};

startServer();
