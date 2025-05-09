import { Request, Response, NextFunction } from 'express';
import logger from '../../utils/logger';
import NotFoundException from '../../exceptions/notFoundException';

const notFoundError = (error: Error, req: Request, res: Response, next: NextFunction): void => {
  // Handle ValidationException errors
  if (error instanceof NotFoundException) {
    logger.warn('Resource not found', {
      payload: {
        method: req.method,
        path: req.path,
        message: error.message,
        ...error.payload,
      },
    });
    // Return error response for Joi validation exception
    res.status(error.statusCode).json({
      success: false,
      error: error.message,
    });
    return;
  }

  next(error);
};

export default notFoundError;
