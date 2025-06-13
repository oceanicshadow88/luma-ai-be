import { DEFAULT_LOCALE, LOCALE_LIST } from '@src/config';
import Joi from 'joi';

const baseAuthSchema = Joi.object({
  email: Joi.string()
    .required()
    .trim()
    .lowercase()
    .pattern(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
    .messages({
      'string.pattern.base': 'Sorry, please type a valid email',
      'string.empty': 'Please enter your email',
    }),

  password: Joi.string()
    .required()
    .min(8)
    .max(20)
    .trim()
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/)
    .messages({
      'string.empty': 'Please enter your password',
      'string.min': 'Please lengthen this text to 8 characters or more',
      'string.pattern.base':
        'Password must include at least one uppercase letter, one lowercase letter, one number, and one special character',
    }),
});

const registerSchema = baseAuthSchema.keys({
  firstname: Joi.string().required().messages({
    'string.empty': 'First Name is required',
  }),

  lastname: Joi.string().required().messages({
    'string.empty': 'Last Name is required',
  }),
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

  verifyCode: Joi.string().required().messages({
    'string.empty': 'Verification code is required',
  }),

  confirmPassword: Joi.string().required().valid(Joi.ref('password')).messages({
    'any.only': 'Passwords do not match',
  }),

  termsAccepted: Joi.boolean().valid(true).required().messages({
    'any.only': 'You must agree to the terms to continue',
  }),

  active: Joi.boolean().default(true).messages({
    'boolean.base': 'Active must be a boolean value',
  }),
});

const freshTokenSchema = Joi.object({
  refreshToken: Joi.string().required().messages({
    'string.empty': 'RefreshToken is required',
  }),
});

const authValidationSchema = {
  register: registerSchema,
  learnerRegister: registerSchema,
  login: baseAuthSchema,
  freshToken: freshTokenSchema,
};

export default authValidationSchema;
