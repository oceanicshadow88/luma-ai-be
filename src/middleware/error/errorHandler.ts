import { Request, Response, ErrorRequestHandler, NextFunction } from 'express';
import AppException from '../../exceptions/appException';
import logger from '../../utils/logger';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import Joi from 'joi';

const errorHandler: ErrorRequestHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // If the response header has already been sent, skip the subsequent processing directly
  if (res.headersSent) {
    return next(err);
  }

  // JWT token Error
  if (err instanceof TokenExpiredError) {
    res.status(401).json({
      success: false,
      message: 'Token has expired',
    });
    return;
  }

  if (err instanceof JsonWebTokenError) {
    res.status(401).json({
      success: false,
      message: 'Invalid token',
    });
    return;
  }

  //Joi Error
  if (err instanceof Joi.ValidationError) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
    return;
  }

  // Custom error handler
  if (err instanceof AppException) {
    const responseBody: Record<string, unknown> = {
      success: false,
      message: err.message,
    };

    if (err.payload != null) {
      responseBody.payload = err.payload;
    }

    res.status(err.statusCode).json(responseBody);
    return;
  }

  // Unknow error
  logger.error('[Unhandled Error]', err);
  res.status(500).json({
    success: false,
    message: 'Unhandled Error',
  });
};

export default errorHandler;
