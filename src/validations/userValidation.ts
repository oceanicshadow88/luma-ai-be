import { Request, Response, NextFunction } from 'express';
import { AppError } from '../error/errorApp';

/**
 * Validates user input for creating or updating a user
 */
export const validateUser = (req: Request, res: Response, next: NextFunction) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return next(new AppError('Please provide name, email, and password', 400));
  }

  // Validate email format
  const emailRegex =
    /^(([^<>()[\]\.,;:\s@"]+(\.[^<>()[\]\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  if (!emailRegex.test(email)) {
    return next(new AppError('Please provide a valid email', 400));
  }

  // Validate password length
  if (password.length < 6) {
    return next(new AppError('Password must be at least 6 characters', 400));
  }

  next();
};
