import { Request, Response, NextFunction } from 'express';
import { ObjectSchema } from 'joi';

declare module 'express-serve-static-core' {
  interface Request {
    validatedQuery?: unknown;
    companySlug?: string;
  }
}

const validateBody = (schema: ObjectSchema) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const value = await schema.validateAsync(req.body, {
      stripUnknown: true,
      allowUnknown: true,
    });
    req.body = value;
    next();
  };
};

const validateQuery = (schema: ObjectSchema) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const value = await schema.validateAsync(req.query, {
      stripUnknown: true,
      allowUnknown: true,
    });
    req.validatedQuery = value;
    next();
  };
};

export { validateBody, validateQuery };
