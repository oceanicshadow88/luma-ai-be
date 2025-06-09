import { Request, Response } from 'express';
export const roadmapsController = async (req: Request, res: Response) => {
  if (!req.user?.id) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }
  res.status(200).json({ success: true, message: 'Roadmap' });
};
