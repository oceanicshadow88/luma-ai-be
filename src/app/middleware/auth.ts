import { Request, Response, NextFunction } from 'express';

interface RequestWithUser extends Request {
  user: {
    _id: string;
    [key: string]: string | number | boolean;
  };
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Example: attach a mock user to the request
  // In production, verify JWT and extract user info
  (req as RequestWithUser).user = { _id: 'mockUserId' }; // Replace with real user extraction
  next();
};
