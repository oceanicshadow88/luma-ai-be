import { Request, Response, NextFunction } from 'express';
import logger from '../../utils/logger';
import ForbiddenException from '../../exceptions/forbiddenException';

const forbiddenError = (error: Error, req: Request, res: Response, next: NextFunction): void => {
  // Handle ValidationException errors
  if (error instanceof ForbiddenException) {
    logger.warn('Unauthorized operation', {
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

export default forbiddenError;
