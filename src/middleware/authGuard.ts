import { Request, Response, NextFunction } from 'express';
import { jwtUtils } from '../lib/jwtUtils';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    [key: string]: any;
  };
}

/**
 * Middleware to verify JWT token and authorize access to protected routes
 * Returns a middleware function compatible with Express
 */
export const authGuard = (req: Request, res: Response, next: NextFunction): void => {
  try {

    // Get auth header
    const authHeader = req.header('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Access denied. No token provided.' });
      return;
    }

    // Extract token from header
    const token = authHeader.split(' ')[1];

    if (!token) {
      res.status(401).json({ error: 'Access denied. No token provided.' });
      return;
    }

    try {
      // Verify token
      const decoded = jwtUtils.verifyAccessToken(token);

      // Attach user info to request
      (req as AuthRequest).user = decoded;

      next();
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'TokenExpiredError') {
          res.status(401).json({ error: 'Token expired' });
          return;
        }

        if (error.name === 'JsonWebTokenError') {
          res.status(401).json({ error: 'Invalid token' });
          return;
        }
      }

      res.status(401).json({ error: 'Invalid token' });
      return;
    }
  } catch (error) {
    next(error);
  }
};
