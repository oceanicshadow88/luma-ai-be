import { type Application } from 'express';

import app from '../../loaders/app';

let application: Application | null = null;

export const loadApp = async (): Promise<Application> => {
  if (application) {
    return application;
  }

  // Create a simple express app for testing
  application = app;

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
