import { Request, Response, NextFunction } from 'express';
import logger from '../../utils/logger';

export const validationError = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Check error type
  if(error.name === 'ValidationError'){
    // record
    logger.info('Validation error', {
      payload: {
        type: 'Validation',
        path: req.path,
        method: req.method,
        error,
      },
    });
    // response
    res.status(400).json({
      success: false,
      error: error.message,
    });
  };
  
  // next function pass error to handler
  next(error);
 
};
