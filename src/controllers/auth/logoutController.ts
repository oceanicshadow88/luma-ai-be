import { Request, Response, NextFunction } from 'express';
import { logoutService } from '../../services/auth/logoutService';
export const userLogout = async (req: Request, res: Response, _next: NextFunction) => {
  const { refreshToken } = req.body;
  await logoutService.logoutUser(refreshToken);
  res.status(204).send();
};
