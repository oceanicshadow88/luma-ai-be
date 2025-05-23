import Joi from 'joi';
import { COMPANY_PLANS, LOCALES, TIMEZONES } from '../config';

// logoUrl
const logoUrlRegex = /^https?:\/\/.*\.(jpeg|jpg|png|gif|webp|svg)$/i;

// hex color
const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;

export const companyValidationSchema = Joi.object({
  companyName: Joi.string().trim().required(),

  slug: Joi.string().trim().lowercase().optional(),

  plan: Joi.string()
    .valid(...COMPANY_PLANS)
    .default('free')
    .required(),

  ownerId: Joi.string().length(24).hex().optional(),

  settings: Joi.object({
    timezone: Joi.string()
      .valid(...TIMEZONES)
      .default('UTC'),
    locale: Joi.string()
      .valid(...LOCALES)
      .default('en-US'),
    logoUrl: Joi.string()
      .allow('')
      .pattern(logoUrlRegex)
      .messages({ 'string.pattern.base': 'logoUrl must be a valid image URL' })
      .default(''),
    primaryColor: Joi.string()
      .pattern(hexColorRegex)
      .messages({ 'string.pattern.base': 'primaryColor must be a valid hex color code' })
      .default('#000000'),
  })
    .optional()
    .default({}),

  active: Joi.boolean().default(true).optional(),

  user: Joi.object({
    firstname: Joi.string().required(),
    lastname: Joi.string().required(),
    username: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().required(),
    verifyCode: Joi.string().required(),
    locale: Joi.string().valid('en', 'zh').optional(),
  }).optional()
});
