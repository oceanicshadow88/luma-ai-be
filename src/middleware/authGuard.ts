import { RoleType } from '@src/types/constantsTypes';
import { HttpStatusCode } from 'axios';
import { NextFunction, Request, Response } from 'express';
import { Types } from 'mongoose';

import AppException from '../exceptions/appException';
import { jwtUtils } from '../lib/jwtUtils';
import UserModel, { USER_STATUS } from '../models/user';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        username: string;
        status: USER_STATUS;
        role: RoleType;
      };
    }
  }
}

/**
 * Middleware to verify JWT token and authorize access to protected routes
 * Checks if the token is valid, not expired, and that the user exists and is active.
 */
export const authGuard = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  // Get auth header
  const authHeader = req.header('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    throw new AppException(HttpStatusCode.Unauthorized, 'Unauthorized Access', {
      payload: 'Access denied. No token provided with Bearer Auth.',
    });
  }

  // Extract token
  const token = authHeader.substring(7);
  // Verify token signature and expiration
  const payload = jwtUtils.verifyAccessToken(token);
  if (!payload) {
    throw new AppException(HttpStatusCode.Unauthorized, 'Unauthorized Access', {
      payload: 'Cannot find token payload',
    });
  }
  // Check if user still exists and is active
  const user = await UserModel.findOne({
    _id: payload.userId,
    company: req.companyId,
    status: USER_STATUS.ACTIVE,
  }).select('-password -refreshToken');

  if (!user) {
    throw new AppException(HttpStatusCode.Forbidden, 'Unauthorized Access', {
      payload: 'Token is valid but user no longer exists.',
    });
  }

  req.user = {
    id: (user._id as Types.ObjectId).toString(),
    email: user.email,
    username: user?.username || '',
    status: user.status as USER_STATUS,
    role: user.role as RoleType,
  };

  next();
};

/**
 * Lite version of authGuard that does not check user existence or status
 * WHY DO I NEED TWO ??????
 */
export const authGuardLite = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.header('Authorization');

  if (!authHeader?.startsWith('Bearer ')) {
    throw new AppException(HttpStatusCode.Unauthorized, 'Unauthorized Access', {
      payload: 'Access denied. No token provided with Bearer Auth.',
    });
  }

  const token = authHeader.substring(7);

  const payload = jwtUtils.verifyAccessToken(token);
  if (!payload) {
    throw new AppException(HttpStatusCode.Unauthorized, 'Unauthorized Access', {
      payload: 'Cannot find token payload',
    });
  }

  req.user = {
    id: payload.userId,
    email: payload.email || '',
    username: payload.name || '',
    // eslint-disable-next-line local/no-dev-notes
    status: payload.status as USER_STATUS, // maybe there will be a bug
    role: payload.role as RoleType,
  };

  next();
};
