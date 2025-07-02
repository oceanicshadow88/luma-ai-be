import { ErrorRequestHandler, NextFunction, Request, Response } from 'express';
import Joi from 'joi';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import multer from 'multer';

import AppException from '../../exceptions/appException';
import logger from '../../utils/logger';

const isDev = process.env.NODE_ENV !== 'production';

function logAndRespond(
  err: Error,
  res: Response,
  logLabel: string,
  statusCode: number,
  payload?: object,
): void {
  logger.error(`[${logLabel}]: ${err.message}`, payload);

  res.status(statusCode).json({
    success: false,
    message: isDev ? err.message : 'Internal Server Error',
  });
}

const errorHandler: ErrorRequestHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (res.headersSent) {
    logger.error(`[HeadersSent Error]: ${err.message}`);
    return next(err);
  }

  if (err instanceof TokenExpiredError) {
    return logAndRespond(err, res, 'TokenExpired Error', 401);
  }

  if (err instanceof JsonWebTokenError) {
    return logAndRespond(err, res, 'JsonWebToken Error', 401);
  }

  if (err instanceof Joi.ValidationError) {
    return logAndRespond(err, res, 'Validation Error', 400);
  }

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

    return logAndRespond(err, res, 'File upload error', 400, { reason: message });
  }

  if (err instanceof AppException) {
    return logAndRespond(err, res, 'AppException', err.statusCode, {
      stack: err.stack,
      ...(err.payload ? { payload: err.payload } : {}),
    });
  }

  return logAndRespond(err, res, 'Unhandled Error', 500, { stack: err.stack });
};

export default errorHandler;
