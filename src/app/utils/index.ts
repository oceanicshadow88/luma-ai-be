/**
 * Utility functions for the application
 */
import { Request, Response, NextFunction } from 'express';

/**
 * Format response object
 * @param success - Indicates if the request was successful
 * @param data - The data to be returned
 * @param message - Optional message
 */
export const formatResponse = <T>(success: boolean, data: T, message?: string) => {
  return {
    success,
    data,
    message,
    timestamp: new Date().toISOString(),
  };
};

/**
 * Async handler to avoid try/catch blocks
 * @param fn - The async function to handle
 */
export const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>) =>
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
