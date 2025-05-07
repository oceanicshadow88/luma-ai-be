import { Request, Response, NextFunction } from 'express';
import logger from '../../utils/logger';

export const finalError = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // record
  logger.error('Unexpected error occurred', {
    payload: {
      error: error.message,
      path: req.path,
      method: req.method,
    },
  });
  // response
  res.status(500).json({
    success: false,
    error: 'Something went wrong',
  });
};
