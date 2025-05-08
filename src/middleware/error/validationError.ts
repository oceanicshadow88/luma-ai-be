import { Request, Response, NextFunction } from 'express';
import logger from '../../utils/logger';
import ValidationException from '../../exceptions/validationException';

const validationError = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  // Handle ValidationException errors
  if (error instanceof ValidationException) {
    logger.warn('Joi Validation error', {
      payload: {
        path: req.path,
        method: req.method,
        error,
      },
    });
    // Return error response for Joi validation exception
    res.status(error.statusCode).json({
      success: false,
      error: error.message,
    });
    return;
  }

  // Handle Mongoose validation errors
  if (error.name === 'ValidationError') {
    logger.error('Mongoose Validation error', {
      payload: {
        path: req.path,
        method: req.method,
        error,
      },
    });
    // Return error response for Mongoose validation error
    res.status(400).json({
      success: false,
      error: error.message,
    });
    return;
  }

  // If the error is not a ValidationException or Mongoose ValidationError,
  // just pass the error to the next error handler
  next(error);
};

export default validationError;
