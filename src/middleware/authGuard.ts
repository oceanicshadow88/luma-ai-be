import { Request, Response, NextFunction } from 'express';
import { jwtUtils } from '../lib/jwtUtils';

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

  // Extract token from header
  const token = authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ error: 'Access denied. No token provided.' });
    return;
  }


  // Verify token
  const decoded = jwtUtils.verifyAccessToken(token);

  if (decoded.name && decoded.email && decoded.role) {
    req.user = {
      _id: decoded.userId,
      name: decoded.name,
      email: decoded.email,
      role: decoded.role,
    };
  }

  next();
};
