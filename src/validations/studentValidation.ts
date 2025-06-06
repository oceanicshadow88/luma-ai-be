import Joi from 'joi';

// Schema for validating student registration data
export const registerStudentSchema = Joi.object({
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
    .min(8)
    .max(20)
    .trim()
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,20}$/)
    .messages({
      'string.empty': 'Password is required',
      'string.min': 'Password must be at least 8 characters long',
      'string.max': 'Password must be at most 20 characters long',
      'string.pattern.base':
        'Password must be 8–20 characters and contain at least one uppercase letter, lowercase letter, number and special character',
    }),
  confirmPassword: Joi.string().required().valid(Joi.ref('password')).messages({
    'string.empty': 'Please confirm your password',
    'any.only': 'Passwords do not match',
  }),
  verificationCode: Joi.string().length(6).required().messages({
    'string.length': 'Verification code must be 6 digits',
    'string.empty': 'Verification code is required',
  }),
  termsAccepted: Joi.boolean().valid(true).required().messages({
    'any.only': 'You must agree to the terms to continue',
    'any.required': 'You must agree to the terms to continue',
  }),
  institutionSlug: Joi.string().required().messages({
    'any.required': 'Institution ID is required',
  }),
  firstName: Joi.string().required().messages({
    'any.required': 'First name is required',
  }),
  lastName: Joi.string().required().messages({
    'any.required': 'Last name is required',
  }),
});
