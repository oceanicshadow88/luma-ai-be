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

  owner: Joi.string().length(24).hex().optional(),

  settings: Joi.object({
    timezone: Joi.string()
      .valid(...TIMEZONES)
      .default('UTC')
      .messages({
        'any.only': `timezone invalid, Eg:${TIMEZONES[0]}`,
      }),
    locale: Joi.string()
      .valid(...LOCALES)
      .default('en-US')
      .messages({
        'any.only': `Locale must be either: ${LOCALES.join(', ')}`,
      }),
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
});
