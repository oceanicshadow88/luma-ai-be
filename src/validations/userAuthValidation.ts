import Joi from 'joi';

const baseAuthSchema = Joi.object({
  email: Joi.string()
    .required()
    .trim()
    .lowercase()
    .pattern(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
    .messages({
      'string.pattern.base': 'It is not a valid email address',
      'string.empty': 'Email is required',
    }),

  password: Joi.string()
    .required()
    .min(6)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?#&])[A-Za-z\d@$!%*?#&]{6,}$/)
    .messages({
      'string.pattern.base':
        'Password must include uppercase, lowercase, number, and special character',
      'string.min': 'Password must be at least 6 characters',
      'string.empty': 'Password is required',
    }),
});

const registerSchema = baseAuthSchema.keys({
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

  locale: Joi.string().valid('en', 'zh').default('en').messages({
    'any.only': 'Locale must be either "en" or "zh"',
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
  login: baseAuthSchema,
  freshToken: freshTokenSchema,
};

export default authValidationSchema;
