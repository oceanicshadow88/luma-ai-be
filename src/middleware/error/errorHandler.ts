import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import AppException from '../../exceptions/appException';
import logger from '../../utils/logger';

const errorHandler: ErrorRequestHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  // Return error detail
  if (err instanceof AppException) {
    const responseBody: Record<string, any> = {
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
