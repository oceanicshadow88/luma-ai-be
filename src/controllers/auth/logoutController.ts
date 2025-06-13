import { logoutService } from '@src/services/auth/logoutService';
import { Request, Response } from 'express';
export const userLogout = async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  await logoutService.logoutUser(refreshToken);
  res.status(204).send();
};
