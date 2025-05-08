import { Request, Response, NextFunction } from 'express';
import { ObjectSchema } from 'joi';
import ValidationException from '../exceptions/validationException';

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
      next(new ValidationException((error as Error).message, { error: error as Error }));
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
      req.query = value;
      next();
    } catch (error) {
      next(new ValidationException((error as Error).message, { error: error as Error }));
    }
  };
};

export { validateBody, validateQuery };
