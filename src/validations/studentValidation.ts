import Joi from 'joi';

export const registerStudentSchema = Joi.object({
  username: Joi.string().min(3).max(20).required().messages({
    'string.min': 'Username must be at least 3 characters long',
    'string.max': 'Username cannot exceed 20 characters',
    'any.required': 'Username is required',
  }),
  email: Joi.string().email().required().messages({
    'string.email': 'Please enter a valid email address',
    'any.required': 'Email is required',
  }),
  password: Joi.string().min(8).required().messages({
    'string.min': 'Password must be at least 8 characters long',
    'any.required': 'Password is required',
  }),
  verificationCode: Joi.string().length(6).required().messages({
    'string.length': 'Verification code must be 6 characters long',
    'any.required': 'Verification code is required',
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
