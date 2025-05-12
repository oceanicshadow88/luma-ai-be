// authentication, authorization
import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/authServer';

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Validate Data - Joi validate schema: deal in route with authvalidation middleware
    // Get params from request body
    const {
      firstname,
      lastname,
      username,
      password,
      email,
      avatarUrl,
      locale,
    }: {
      firstname: string;
      lastname: string;
      username: string;
      password: string;
      email: string;
      avatarUrl?: string;
      locale?: string;
    } = req.body;

    const { refreshToken } = await authService.registerUser({
      firstname,
      lastname,
      username,
      password,
      email,
      avatarUrl,
      locale,
    });

    // request
    res.status(201).json({ success: true, data: { refreshToken } });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password }: { email: string; password: string } = req.body;

    const { refreshToken } = await authService.loginUser({ email, password });

    res.json({ success: true, data: { refreshToken } });
  } catch (error) {
    return next(error);
  }
};

export const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.body;

    const tokens = await authService.refreshAuthToken(refreshToken);

    res.json({ success: true, data: tokens });
  } catch (error) {
    if (error instanceof Error && error.name === 'JsonWebTokenError') {
      return res.status(403).json({ error: 'Invalid refresh token' });
    }

    if (error instanceof Error && error.name === 'TokenExpiredError') {
      return res.status(403).json({ error: 'Refresh token expired' });
    }

    return next(error);
  }
};

export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.body;
    await authService.logoutUser(refreshToken);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
