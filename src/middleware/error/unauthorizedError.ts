import { Request, Response, NextFunction } from 'express';
import logger from '../../utils/logger';
import UnauthorizedException from '../../exceptions/unauthorizedException';

const unauthorizedError = (error: Error, req: Request, res: Response, next: NextFunction): void => {
  // Check error type
  if (error instanceof UnauthorizedException) {
    // record
    logger.info('Unauthorized access', {
      payload: {
        method: req.method,
        path: req.path,
        message: error.message,
        ...error.payload,
      },
    });
    // response
    res.status(error.statusCode).json({
      success: false,
      error: error.message,
    });
  }

  next();
};

export default unauthorizedError;
