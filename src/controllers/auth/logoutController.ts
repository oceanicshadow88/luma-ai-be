import { Request, Response } from 'express';

import { logoutService } from '../../services/auth/logoutService';
export const userLogout = async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  await logoutService.logoutUser(refreshToken);
  res.status(204).send();
};
