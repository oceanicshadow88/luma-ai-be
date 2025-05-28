import Joi from 'joi';
import {
  COMPANY_PLAN_LIST,
  DEFAULT_COMPANY_PLAN,
  DEFAULT_LOCALE,
  DEFAULT_TIMEZONE,
  LOCALE_LIST,
  TIMEZONES,
} from '../config';

// logoUrl
const logoUrlRegex = /^https?:\/\/.*\.(jpeg|jpg|png|gif|webp|svg)$/i;

// hex color
const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;

export const companyValidationSchema = Joi.object({
  companyName: Joi.string().trim().required(),

  slug: Joi.string().trim().lowercase().optional(),

  plan: Joi.string()
    .valid(...COMPANY_PLAN_LIST)
    .default(DEFAULT_COMPANY_PLAN)
    .required(),

  owner: Joi.string().length(24).hex().optional(),

  settings: Joi.object({
    timezone: Joi.string()
      .valid(...TIMEZONES)
      .default(DEFAULT_TIMEZONE)
      .messages({
        'any.only': `timezone invalid, Eg:${DEFAULT_TIMEZONE}`,
      }),
    locale: Joi.string()
      .valid(...LOCALE_LIST)
      .default(DEFAULT_LOCALE)
      .messages({
        'any.only': `Locale must be either: ${LOCALE_LIST.join(',')}`,
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
