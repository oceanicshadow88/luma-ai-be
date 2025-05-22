import Joi from 'joi';
import { COMPANY_PLANS } from '../config';

export const createCompanySchema = Joi.object({
  name: Joi.string()
    .required(),

  plan: Joi.string()
    .valid(...COMPANY_PLANS)
    .required(),

  ownerId: Joi.string()
    .optional(),

  settings: Joi.object({
    timezone: Joi.string().optional(),
    locale: Joi.string().optional(),
    logoUrl: Joi.string().uri().optional(),
    primaryColor: Joi.string().optional(),
  }).optional(),
});
