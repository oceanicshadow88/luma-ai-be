import AppException from '@src/exceptions/appException';
import { HttpStatusCode } from 'axios';
import { Request, Response } from 'express';

import { logoutService } from '../../services/auth/logoutService';
export const userLogout = async (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    throw new AppException(HttpStatusCode.InternalServerError, 'Refresh token is required.');
  }

  await logoutService.logoutUser(refreshToken);

  return res.status(200).json({ message: 'Logged out successfully' });
};
