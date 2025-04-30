/**
 * Utility functions for the application
 */

/**
 * Format response object
 * @param success - Indicates if the request was successful
 * @param data - The data to be returned
 * @param message - Optional message
 */
export const formatResponse = (
  success: boolean,
  data: any,
  message?: string
) => {
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
export const asyncHandler = (fn: Function) => (
  req: any,
  res: any,
  next: any
) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
