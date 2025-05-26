import { Request, Response } from 'express';
import { refreshAuthToken } from '../utils/token';

export const refreshToken = async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  const tokens = await refreshAuthToken(refreshToken);
  res.json({ success: true, data: tokens });
};
