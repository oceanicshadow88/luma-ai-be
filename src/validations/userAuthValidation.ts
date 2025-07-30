import Joi from 'joi';

import { DEFAULT_LOCALE, LOCALE_LIST } from '../config';

const emailSchema = Joi.string()
  .required()
  .trim()
  .lowercase()
  .pattern(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
  .messages({
    'string.pattern.base': 'Sorry, please type a valid email',
    'string.empty': 'Please enter your email',
  });

const passwordSchema = Joi.string()
  .required()
  .min(8)
  .max(20)
  .trim()
  .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/)
  .messages({
    'string.min': 'Please lengthen this text to 8 characters or more',
    'string.pattern.base':
      'Password must include at least one uppercase letter, one lowercase letter, one number, and one special character',
  });

const baseAuthSchema = Joi.object({
  email: emailSchema,
  password: passwordSchema,
});

const nameSchema = Joi.string()
  .pattern(/^[a-zA-Z]+$/)
  .min(2)
  .max(20)
  .required()
  .messages({
    'string.pattern.base': '{{#label}} must contain only letters',
    'string.empty': '{{#label}} is required',
    'string.min': '{{#label}} must be at least 2 characters',
    'string.max': '{{#label}} must be less than 20 characters',
  });

const registerSchema = baseAuthSchema.keys({
  firstName: nameSchema.label('First name'),

  lastName: nameSchema.label('Last name'),

  username: Joi.string()
    .required()
    .pattern(/^[a-zA-Z0-9._-]+$/)
    .min(2)
    .max(20)
    .messages({
      'string.pattern.base':
        'Username can only contain letters, numbers, dots, underscores, and hyphens',
      'string.min': 'Username must be at least 2 characters',
      'string.max': 'Username must be less than 20 characters',
      'string.empty': 'Username is required',
    }),

  avatarUrl: Joi.string()
    .allow('')
    .custom((value, helpers) => {
      if (value === '') return value;
      const isValid = /^https?:\/\/.*\.(jpeg|jpg|png|gif|webp|svg)$/i.test(value);
      if (!isValid) {
        return helpers.error('any.invalid');
      }
      return value;
    })
    .messages({
      'any.invalid': 'Avatar url must be a valid image URL',
    }),

  locale: Joi.string()
    .valid(...LOCALE_LIST)
    .default(DEFAULT_LOCALE)
    .trim()
    .messages({
      'any.only': `Locale must be either: ${LOCALE_LIST.join(', ')}`,
    }),

  verifyValue: Joi.string().required().messages({
    'string.empty': 'VerifyValue is required',
  }),

  termsAccepted: Joi.boolean().valid(true).required().messages({
    'any.only': 'You must agree to the terms to continue',
  }),

  active: Joi.boolean().default(true).messages({
    'boolean.base': 'Active must be a boolean value',
  }),
  token: Joi.string().optional(),
});

const freshTokenSchema = Joi.object({
  refreshToken: Joi.string().required().messages({
    'string.empty': 'RefreshToken is required',
  }),
});

const resetPasswordSchema = Joi.object({
  email: emailSchema,
  newPassword: passwordSchema,
  verifyValue: Joi.string().required().messages({
    'string.empty': 'VerifyValue is required',
  }),
});

const verificationCodeSchema = Joi.object({
  email: emailSchema,
});

const authValidationSchema = {
  register: registerSchema,
  learnerRegister: registerSchema,
  login: baseAuthSchema,
  freshToken: freshTokenSchema,
  resetPassword: resetPasswordSchema,
  verificationCode: verificationCodeSchema,
};

export default authValidationSchema;
