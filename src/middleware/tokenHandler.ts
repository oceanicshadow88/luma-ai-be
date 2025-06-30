import { Request, Response } from 'express';

import UserModel from '../models/user';

export const refreshToken = async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  const tokens = await UserModel.refreshAuthToken(refreshToken);
  res.json({ success: true, data: tokens });
};
