import { Request, Response, NextFunction } from 'express';
import { validateToken } from '../utils/jwt';

const authGuard = (req: Request, res: Response, next: NextFunction) => {
  const authorization = req.header('Authorization');
  if (!authorization) {
    res.status(401).json({ success: false, error: 'Missing Authorization Token' });
    return;
  }

  // Bearer: xxxxx
  const [type, token] = authorization.split(' ');
  // not bearer or no token pass
  if (type !== 'Bearer' || !token) {
    res.status(401).json({ success: false, error: 'Invalid Token' });
    return;
  }

  // token invalid
  const payload = validateToken(token);
  if (!payload) {
    res.status(401).json({ success: false, error: 'Invalid Token' });
    return;
  }

  // all successful
  next();
};

export default authGuard;
