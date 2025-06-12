import { HttpStatusCode } from 'axios';
import { authService } from '../../services/auth/authService';
import { Request, Response } from 'express';

export const verifyAuthToken = async (req: Request, res: Response) => {
  const { token } = req.body;
  await authService.verifyToken(token);

  return res.sendStatus(HttpStatusCode.Ok);
};
