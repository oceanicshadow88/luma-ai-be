import { Request, Response, NextFunction } from 'express';
import logger from '../../utils/logger';
import ConflictsException from '../../exceptions/conflictsException';

const conflictsError = (error: Error, req: Request, res: Response, next: NextFunction): void => {
  // Handle ValidationException errors
  if (error instanceof ConflictsException) {
    logger.warn('Resource conflict', {
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

  // just pass the error to the next error handler
  next(error);
};

export default conflictsError;
