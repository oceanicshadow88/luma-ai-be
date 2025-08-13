import { ROLES } from '@src/types/constants';
import Joi from 'joi';

export const invitationSchema = Joi.object({
  email: Joi.string()
    .required()
    .trim()
    .lowercase()
    .pattern(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
    .messages({
      'string.pattern.base': 'It is not a valid email address',
      'string.empty': 'Email is required',
    }),
  role: Joi.string().required().valid(ROLES.INSTRUCTOR, ROLES.LEARNER, ROLES.ADMIN).messages({
    'string.empty': 'Role is required',
    'any.only': 'Role must be either instructor, learner, or admin',
  }),
});
