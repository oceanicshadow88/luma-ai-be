import { Request, Response } from 'express';
export const quizzesController = async (req: Request, res: Response) => {
  if (!req.user?.id) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }
  res.status(200).json({ success: true, message: 'Quiz' });
};
