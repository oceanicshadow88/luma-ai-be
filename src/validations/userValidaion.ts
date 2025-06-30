import Joi from 'joi';

import { paginationValidationSchema } from './paginationValidation';
import authValidationSchema from './userAuthValidation';

export const userValidateSchema = {
  search: Joi.object({
    q: Joi.string().trim().min(1).max(100).messages({
      'string.min': 'Query must be at least 1 character',
      'string.max': 'Query must be at most 100 characters',
    }),
    ...paginationValidationSchema,
  }),

  update: authValidationSchema.register.fork(
    Object.keys(authValidationSchema.register.describe().keys),
    schema => schema.optional(),
  ),
};
