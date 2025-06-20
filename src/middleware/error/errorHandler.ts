import { Request, Response, ErrorRequestHandler, NextFunction } from 'express';
import AppException from '../../exceptions/appException';
import logger from '../../utils/logger';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import Joi from 'joi';
import multer from 'multer';

const errorHandler: ErrorRequestHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // If the response header has already been sent, skip the subsequent processing directly
  if (res.headersSent) {
    logger.error('[HeadersSent Error]', err);
    return next(err); //Error passed to express for default handling
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

  //File upload
  if (err instanceof multer.MulterError) {
    let message = 'File upload error';

    switch (err.code) {
      case 'LIMIT_FILE_SIZE':
        message = 'File size exceeds 5MB limit';
        break;
      case 'LIMIT_UNEXPECTED_FILE':
        message = 'Invalid file type';
        break;
    }

    res.status(400).json({ message });
    return;
  }

  // Custom error handler
  if (err instanceof AppException) {
    logger.error('Error:', err.message);
    const responseBody: Record<string, unknown> = {
      success: false,
      message: 'Internal Server Error',
    };

    if (err.payload != null) {
      responseBody.payload = err.payload;
    }

    res.status(err.statusCode).json(responseBody);
    return;
  }

  logger.error('[Unhandled Error]', err);
  res.status(500).json({
    success: false,
    message: 'Unhandled Error',
  });
};

export default errorHandler;
