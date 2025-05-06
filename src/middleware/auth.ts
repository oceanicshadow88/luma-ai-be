import { Request, Response, NextFunction } from 'express';

declare module 'express' {
  interface Request {
    user?: {
      _id: string;
      name?: string;
      email?: string;
      role?: string;
    };
  }
}

export const auth = (req: Request, res: Response, next: NextFunction) => {
  // Example: attach a mock user to the request
  // In production, verify JWT and extract user info
  req.user = { _id: 'mockUserId' };
  next();
};
