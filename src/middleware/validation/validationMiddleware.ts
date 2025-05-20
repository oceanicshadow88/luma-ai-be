import { Request, Response, NextFunction } from 'express';
import { ObjectSchema } from 'joi';
import AppException from '../../exceptions/appException';
import { HttpStatusCode } from 'axios';

declare module 'express-serve-static-core' {
  interface Request {
    validatedQuery?: unknown;
  }
}

const validateBody = (schema: ObjectSchema) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const value = await schema.validateAsync(req.body, {
        stripUnknown: true,
        allowUnknown: true,
      });
      req.body = value;
      next();
    } catch (error) {
      next(
        new AppException(HttpStatusCode.BadRequest, (error as Error).message, {
          error: error as Error,
        }),
      );
    }
  };
};

const validateQuery = (schema: ObjectSchema) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const value = await schema.validateAsync(req.query, {
        stripUnknown: true,
        allowUnknown: true,
      });
      req.validatedQuery = value;
      next();
    } catch (error) {
      next(
        new AppException(HttpStatusCode.BadRequest, (error as Error).message, {
          error: error as Error,
        }),
      );
    }
  };
};

export { validateBody, validateQuery };
