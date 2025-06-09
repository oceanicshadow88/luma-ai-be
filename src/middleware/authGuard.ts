import { Request, Response, NextFunction } from 'express';
import { jwtUtils } from '../lib/jwtUtils';
import UserModel from '../models/user';
import { Types } from 'mongoose';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        username: string;
        active: boolean;
      };
    }
  }
}

/**
 * Middleware to verify JWT token and authorize access to protected routes
 * Checks if the token is valid, not expired, and that the user exists and is active.
 */
export const authGuard = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Get auth header
    const authHeader = req.header('Authorization');

    if (!authHeader?.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.',
      });
      return;
    }

    // Extract token
    const token = authHeader.substring(7);

    // Verify token signature and expiration
    const payload = jwtUtils.verifyAccessToken(token);

    // Check if user still exists and is active
    const user = await UserModel.findById(payload.user).select('-password -refreshToken');

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Token is valid but user no longer exists',
      });
      return;
    }

    if (!user.active) {
      res.status(401).json({
        success: false,
        message: 'User account is inactive',
      });
      return;
    } // Add user info to request object
    req.user = {
      id: (user._id as Types.ObjectId).toString(),
      email: user.email,
      username: user.username,
      active: user.active,
    };

    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid or expired token' + (error instanceof Error ? `: ${error.message}` : ''),
    });
  }
};

/**
 * Lite version of authGuard that does not check user existence or status
 */
export const authGuardLite = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.header('Authorization');

    if (!authHeader?.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.',
      });
      return;
    }

    const token = authHeader.substring(7);
    const payload = jwtUtils.verifyAccessToken(token);

    req.user = {
      id: payload.user,
      email: payload.email || '',
      username: payload.name || '',
      active: true,
    };

    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid or expired token' + (error instanceof Error ? `: ${error.message}` : ''),
    });
  }
};
