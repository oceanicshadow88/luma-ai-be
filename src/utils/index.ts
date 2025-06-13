/**
 * Utility functions for the application
 */
import { NextFunction, Request, Response } from 'express';

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

/**
 * Validates email format
 * @param email - The email to validate
 * @returns boolean - Whether the email format is valid
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validates password based on requirements:
 * - 8 to 20 characters
 * - At least 1 uppercase letter
 * - At least 1 lowercase letter
 * - At least 1 number
 * - At least 1 special character
 * @param password - The password to validate
 * @returns boolean - Whether the password meets all requirements
 */
export const isValidPassword = (password: string): boolean => {
  // Check length (8-20 characters)
  if (password.length < 8 || password.length > 20) {
    return false;
  }

  // Check for uppercase letter
  if (!/[A-Z]/.test(password)) {
    return false;
  }

  // Check for lowercase letter
  if (!/[a-z]/.test(password)) {
    return false;
  }

  // Check for number
  if (!/[0-9]/.test(password)) {
    return false;
  }

  // Check for special character
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return false;
  }

  return true;
};

/**
 * Generates a random 4-digit code
 * @returns string - A random 4-digit code
 */
export const generateVerificationCode = (): string => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};
