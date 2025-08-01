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
  logMessage?: string;
  logPayload?: Record<string, unknown>;
  field?: string;
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
      message: 'Invalid or  expired token',
      logMessage: 'Token has expired',
      logTag: 'TokenExpired Error',
      field: 'token',
    };
  }

  // JWT token error
  if (err instanceof JsonWebTokenError) {
    return {
      statusCode: 401,
      message: 'Invalid or  expired token',
      logMessage: 'Invalid token',
      logTag: 'JsonWebToken Error',
      field: 'token',
    };
  }

  // Data validation error
  if (err instanceof Joi.ValidationError) {
    return {
      statusCode: 422,
      message: err.message,
      logTag: 'Validation Error',
    };
  }

  // File upload error
  if (err instanceof multer.MulterError) {
    return {
      statusCode: 422,
      message: getMulterErrorMessage(err),
      logMessage: getMulterErrorMessage(err),
      logTag: 'Multer Error',
    };
  }

  // Custom application error
  if (err instanceof AppException) {
    const { field } = err.payload ?? {};
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
      field: typeof field === 'string' ? field : undefined,
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

function logError(err: Error, { logTag, logMessage, logPayload, statusCode }: ErrorInfo): void {
  logger.error(`[${logTag} ${statusCode}]: ${logMessage ?? err.message}`, {
    ...logPayload,
  });
}

function sendErrorResponse(res: Response, { statusCode, message, field }: ErrorInfo): void {
  res.status(statusCode).json({
    success: false,
    message,
    ...(field && { field }),
  });
}

export default errorHandler;
