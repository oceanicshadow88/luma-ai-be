import Joi from 'joi';

import {
  COMPANY_PLAN_LIST,
  DEFAULT_COMPANY_PLAN,
  DEFAULT_LOCALE,
  DEFAULT_TIMEZONE,
  LOCALE_LIST,
  TIMEZONES,
} from '../config';

// hex color
const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;

export const companyValidationSchema = Joi.object({
  companyName: Joi.string()
    .pattern(/^[a-zA-Z0-9 ]+$/)
    .max(20)
    .min(2)
    .trim()
    .required()
    .messages({
      'string.pattern.base': 'Organisation name can only contain letters, numbers, and spaces',
      'string.empty': 'Organisation name is required',
      'string.min': 'Organisation name must be at least 2 characters',
      'string.max': 'Organisation name must be less than 20 characters',
    }),

  slug: Joi.string()
    .pattern(/^[a-z0-9-]+$/)
    .min(2)
    .max(30)
    .trim()
    .lowercase()
    .required()
    .messages({
      'string.pattern.base': 'Slug can only contain lowercase letters, numbers, and hyphens',
      'string.empty': 'Slug is required',
      'string.min': 'Slug must be at least 2 characters',
      'string.max': 'Slug must be less than 30 characters',
    }),

  plan: Joi.string()
    .trim()
    .lowercase()
    .valid(...COMPANY_PLAN_LIST)
    .default(DEFAULT_COMPANY_PLAN)
    .optional(),

  owner: Joi.string().length(24).hex().optional(),

  settings: Joi.object({
    timezone: Joi.string()
      .valid(...TIMEZONES)
      .trim()
      .default(DEFAULT_TIMEZONE)
      .messages({
        'any.only': `timezone invalid, Eg:${TIMEZONES.join(',')}`,
      }),
    locale: Joi.string()
      .valid(...LOCALE_LIST)
      .default(DEFAULT_LOCALE)
      .trim()
      .messages({
        'any.only': `Locale must be either: ${LOCALE_LIST.join(',')}`,
      }),
    primaryColor: Joi.string()
      .pattern(hexColorRegex)
      .messages({ 'string.pattern.base': 'primaryColor must be a valid hex color code' })
      .default('#000000'),
  })
    .optional()
    .default({}),

  active: Joi.boolean().default(true).optional(),
});
