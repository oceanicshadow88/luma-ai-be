import moment from 'moment-timezone';

// Invitation configuration
export const EXPIRES_TIME_CONFIG = {
  EXPIRES_IN_JWT: '24h', // JWT token expiration (for jwt.sign)
  EXPIRES_IN_HOURS: 24, // Hours for database expiration calculation
  EXPIRES_IN_DISPLAY: '24 hours', // Display text for API responses
} as const;

// Company Plan
export const COMPANY_PLANS = {
  FREE: 'free',
  PRO: 'pro',
  ENTERPRISE: 'enterprise',
} as const;
export const COMPANY_PLAN_LIST = Object.values(COMPANY_PLANS);
export const DEFAULT_COMPANY_PLAN = COMPANY_PLANS.FREE;

// Locales
export const LOCALES = {
  EN_US: 'en-US',
  ZH_CN: 'zh-CN',
} as const;
export const LOCALE_LIST = Object.values(LOCALES);
export const DEFAULT_LOCALE = LOCALES.EN_US;

// Timezones
export const TIMEZONES: string[] = moment.tz.names();
export const DEFAULT_TIMEZONE = TIMEZONES[0];

// Membership Role
export const ROLES = {
  ADMIN: 'admin',
  INSTRUCTOR: 'instructor',
  LEARNER: 'learner',
} as const;
export const ROLE_LIST = Object.values(ROLES);
