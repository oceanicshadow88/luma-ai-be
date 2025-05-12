import { Request, Response, NextFunction } from 'express';
import logger from '../../utils/logger';
import NotFoundException from '../../exceptions/notFoundException';

const notFoundError = (error: Error, req: Request, res: Response, next: NextFunction): void => {
  // Check error type
  if (error instanceof NotFoundException) {
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

  next(error);
};

export default notFoundError;
