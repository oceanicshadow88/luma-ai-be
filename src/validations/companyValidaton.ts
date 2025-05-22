import Joi from 'joi';
import { ObjectId } from 'mongodb';

const objectIdValidator = Joi.string().custom((value, helpers) => {
  if (!ObjectId.isValid(value)) {
    return helpers.error('any.invalid');
  }
  return value;
}, 'ObjectId Validation');

// Common Settings Schema
const settingsSchema = Joi.object({
  timezone: Joi.string().optional(),
  locale: Joi.string().optional(),
  logoUrl: Joi.string().uri().optional(),
  primaryColor: Joi.string()
    .pattern(/^#[0-9A-Fa-f]{6}$/)
    .message('Primary color must be a valid hex color')
    .optional(),
});

export const createCompanySchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required(),
  plan: Joi.string().valid('free', 'pro', 'enterprise').required(),
  settings: settingsSchema.optional(),
  active: Joi.boolean().optional(),
});

export const updateCompanySchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).optional(),
  plan: Joi.string().valid('free', 'pro', 'enterprise').optional(),
  settings: settingsSchema.optional(),
  active: Joi.boolean().optional(),
});

export const getCompanySchema = Joi.object({
  id: objectIdValidator.required(),
});

export const checkEmailSchema = Joi.object({
  email: Joi.string()
    .email()
    .pattern(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
    .message('Invalid email domain')
    .required(),
});

export const verifyCodeSchema = Joi.object({
  email: Joi.string().email().required(),
  code: Joi.string().length(4).pattern(/^\d+$/).message('Invalid verification code').required(),
});

export const completeRegistrationSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  name: Joi.string().required(),
  role: Joi.string().valid('admin', 'instructor').required(),
  companyId: objectIdValidator.required(),
});

export const createInviteSchema = Joi.object({
  id: objectIdValidator.required(),
  email: Joi.string().email().required(),
  role: Joi.string().valid('admin', 'instructor').required(),
});

export const acceptInviteSchema = Joi.object({
  token: Joi.string().required(),
});

export const checkCompanySlugSchema = Joi.object({
  companyName: Joi.string().trim().min(2).max(100).required(),
});

export const createCompanyAndAccountSchema = Joi.object({
  email: Joi.string().email().required(),
  companyName: Joi.string().trim().required(),
  password: Joi.string().min(8).required(),
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
});
