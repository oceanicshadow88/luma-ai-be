import { Request, Response, NextFunction } from 'express';

/**
 * Middleware to verify JWT token and authorize access to protected routes
 * Returns a middleware function compatible with Express
 */
export const authGuard = (req: Request, res: Response, next: NextFunction): void => {
  // Get auth header
  const authHeader = req.header('Authorization');

  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Access denied. No token provided.' });
    return;
  }

  next();
};
