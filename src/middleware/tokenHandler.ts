import UserModel from '@src/models/user';
import { Request, Response } from 'express';

export const refreshToken = async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  const tokens = await UserModel.refreshAuthToken(refreshToken);
  res.json({ success: true, data: tokens });
};
