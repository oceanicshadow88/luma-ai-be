import { Request, Response, NextFunction } from 'express';
import logger from '../../utils/logger';

const finalError = (error: Error, req: Request, res: Response, _next: NextFunction): void => {
  // record
  logger.error('Unexpected error occurred', {
    payload: {
      error: error.message,
      stack: error.stack,
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

export default finalError;
