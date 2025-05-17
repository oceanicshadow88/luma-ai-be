import { Request, Response, NextFunction } from 'express';
import { refreshAuthToken } from '../../utils/token';

export const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.body;

    const tokens = await refreshAuthToken(refreshToken);

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
