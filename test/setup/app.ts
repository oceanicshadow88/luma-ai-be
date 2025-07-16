import express, { type Application } from 'express';

let application: Application | null = null;

export const loadApp = async (): Promise<Application> => {
  if (application) {
    return application;
  }

  // Create a simple express app for testing
  application = express();

  // Add basic middleware for testing
  application.use(express.json());
  application.use(express.urlencoded({ extended: true }));

  // Import and setup routes directly from source (not compiled)
  const v1Router = await import('../../src/handlers/v1/api');
  application.use('/api/v1', v1Router.default);

  return application;
};

export const closeApp = async (): Promise<void> => {
  if (!application) {
    return;
  }
  // Express apps don't have a close method, so set to null
  application = null;
};

export const getApplication = (): Application => {
  if (!application) {
    throw new Error('Application not loaded. Call loadApp() first.');
  }
  return application;
};
