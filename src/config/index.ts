import dotenv from 'dotenv';
import moment from 'moment-timezone';

const env: string = process.env.NODE_ENV ?? 'development';
dotenv.config({ path: `.env.${env}` });

interface JwtConfig {
  secret: string;
  expiresIn: string;
  refreshSecret: string;
  refreshExpiresIn: string;
}

export type StringValue = `${number}${'s' | 'm' | 'h' | 'd' | 'w' | 'y'}`;
export type SafePayload = Record<string, unknown>;
interface SmtpConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

interface Config {
  env: string;
  port: number;
  mongoURI: string;
  jwt: JwtConfig;
  rateLimitWindowMS: number;
  rateLimit: number;
  logLevel: string;
  email: {
    host: string;
    port: number;
    secure: boolean;
    auth: {
      user: string;
      pass: string;
    };
    from: string;
  };
  resetCodeExpiry: number;
  resetCodeRateLimit: number;
  resetCodeRateLimitExpiry: number;
  emailFrom: string;
  smtpConfig: SmtpConfig;
  DEFAULT_MOCK_COUNT: number;
}

export const config: Config = {
  env,
  port: parseInt(process.env.PORT ?? '8000', 10),
  mongoURI: process.env.MONGODB_URI ?? 'mongodb://localhost:27017/luma-ai',
  jwt: {
    secret: process.env.JWT_SECRET ?? 'jwt_secret',
    expiresIn: process.env.JWT_EXPIRES_IN ?? '1d',
    refreshSecret: process.env.JWT_REFRESH_SECRET ?? 'jwt_refresh_secret',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '7d',
  },
  rateLimitWindowMS: parseInt(process.env.RATE_LIMIT_WINDOW_MS ?? '60000', 10),
  rateLimit: parseInt(process.env.RATE_LIMIT ?? '100', 10),
  logLevel: process.env.LOG_LEVEL ?? 'info',
  email: {
    host: process.env.EMAIL_HOST ?? 'smtp.example.com',
    port: parseInt(process.env.EMAIL_PORT ?? '587', 10),
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER ?? '',
      pass: process.env.EMAIL_PASS ?? '',
    },
    from: process.env.EMAIL_FROM ?? 'noreply@example.com',
  },
  resetCodeExpiry: parseInt(process.env.RESET_CODE_EXPIRY ?? '900', 10), // 15 minutes in seconds
  resetCodeRateLimit: parseInt(process.env.RESET_CODE_RATE_LIMIT ?? '1', 10), // 1 request allowed
  resetCodeRateLimitExpiry: parseInt(process.env.RESET_CODE_RATE_LIMIT_EXPIRY ?? '60', 10), // 60 seconds
  emailFrom: process.env.EMAIL_FROM ?? 'noreply@luma-ai.com',
  smtpConfig: {
    host: process.env.SMTP_HOST ?? 'smtp.example.com',
    port: parseInt(process.env.SMTP_PORT ?? '587', 10),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER ?? '',
      pass: process.env.SMTP_PASS ?? '',
    },
  },
  DEFAULT_MOCK_COUNT: 666,
};

// Route api
export const ROUTES = {
  LOGIN_USER: '/v1/auth/login',
  REGISTER_COMPANY: '/v1/companies/register',
  REGISTER_USER_ADMIN: ' /v1/auth/register/admin',
};

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
export const roleList = Object.values(ROLE); // value:['admin', 'instructor', 'learner']
// membership status
export const MEMBERSHIP_STATUS = {
  ACTIVE: 'active',
  INVITED: 'invited',
  DISABLED: 'disabled',
} as const;
export type MembershipStatusType = (typeof MEMBERSHIP_STATUS)[keyof typeof MEMBERSHIP_STATUS];
export const DEFAULT_MEMBERSHIP_STATUS = MEMBERSHIP_STATUS.ACTIVE;

export default config;
