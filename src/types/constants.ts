import moment from 'moment-timezone';

// Invitation configuration
export const EXPIRES_TIME_CONFIG = {
  EXPIRES_IN_JWT: '24h', // JWT token expiration (for jwt.sign)
  EXPIRES_IN_HOURS: 24, // Hours for database expiration calculation
  EXPIRES_IN_DISPLAY: '24 hours', // Display text for API responses
} as const;

// Mongoose DB type and default value
// companyPlan
export const COMPANY_PLANS = {
  FREE: 'free',
  PRO: 'pro',
  ENTERPRISE: 'enterprise',
} as const;
export type CompanyPlanType = (typeof COMPANY_PLANS)[keyof typeof COMPANY_PLANS];
export const COMPANY_PLAN_LIST = Object.values(COMPANY_PLANS);
export const DEFAULT_COMPANY_PLAN = COMPANY_PLANS.FREE;

// locales
export const LOCALES = {
  EN_US: 'en-US',
  ZH_CN: 'zh-CN',
} as const;
export type LocaleType = (typeof LOCALES)[keyof typeof LOCALES];
export const LOCALE_LIST = Object.values(LOCALES);
export const DEFAULT_LOCALE = LOCALES.EN_US;

// all timezone
export const TIMEZONES: string[] = moment.tz.names();
export const DEFAULT_TIMEZONE = TIMEZONES[0];

// Membership Role
export const ROLE = {
  ADMIN: 'admin',
  INSTRUCTOR: 'instructor',
  LEARNER: 'learner',
} as const;
export type RoleType = (typeof ROLE)[keyof typeof ROLE];
export const ROLE_LIST = Object.values(ROLE); // value:['admin', 'instructor', 'learner']
