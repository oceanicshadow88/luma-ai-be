import AppException from '@src/exceptions/appException';
import logger from '@src/utils/logger';
import { ErrorRequestHandler, NextFunction, Request, Response } from 'express';
import Joi from 'joi';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import multer from 'multer';

interface ErrorInfo {
  statusCode: number;
  message: string;
  logTag: string;
  logPayload?: Record<string, unknown>;
}

const errorHandler: ErrorRequestHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  // If the response header has already been sent, skip the subsequent processing directly
  if (res.headersSent) {
    logger.error(`[HeadersSent Error]: ${err.message}`);
    return next(err);
  }

  const errorInfo = processError(err, req);
  logError(err, errorInfo);
  sendErrorResponse(res, errorInfo);
};

function processError(err: Error, req: Request): ErrorInfo {
  // Token expired error
  if (err instanceof TokenExpiredError) {
    return {
      statusCode: 401,
      message: 'Token has expired',
      logTag: 'TokenExpired Error',
    };
  }

  // JWT token error
  if (err instanceof JsonWebTokenError) {
    return {
      statusCode: 500,
      message: 'Internal Server Error',
      logTag: 'JsonWebToken Error',
    };
  }

  // Data validation error
  if (err instanceof Joi.ValidationError) {
    return {
      statusCode: 400,
      message: err.message,
      logTag: 'Validation Error',
    };
  }

  // File upload error
  if (err instanceof multer.MulterError) {
    return {
      statusCode: 400,
      message: getMulterErrorMessage(err),
      logTag: 'Multer Error',
    };
  }

  // Custom application error
  if (err instanceof AppException) {
    return {
      statusCode: err.statusCode,
      message: err.statusCode === 500 ? 'Internal Server Error' : err.message,
      logTag: 'AppException',
      logPayload: {
        url: req.originalUrl,
        method: req.method,
        stack: err.stack,
        ...err.payload,
      },
    };
  }

  // Unhandled error
  return {
    statusCode: 500,
    message: 'Internal Server Error',
    logTag: 'Unhandled Error',
    logPayload: {
      url: req.originalUrl,
      method: req.method,
      stack: err.stack,
    },
  };
}

// Multer error message mapping
const multerErrorMessages: Record<string, string> = {
  LIMIT_FILE_SIZE: 'File size exceeds 5MB limit',
  LIMIT_UNEXPECTED_FILE: 'Invalid file type',
} as const;

function getMulterErrorMessage(err: multer.MulterError): string {
  return multerErrorMessages[err.code] ?? 'File upload failed';
}

function logError(err: Error, { logTag, logPayload, statusCode }: ErrorInfo): void {
  logger.error(`[${logTag} ${statusCode}]: ${err.message}`, {
    ...logPayload,
  });
}

function sendErrorResponse(res: Response, { statusCode, message }: ErrorInfo): void {
  res.status(statusCode).json({
    success: false,
    message,
  });
}

export default errorHandler;
