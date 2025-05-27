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
};

// Role object
export const ROLE = {
  ADMIN: 'admin',
  INSTRUCTOR: 'instructor',
  STUDENT: 'student',
} as const;
// type: 'admin' | 'instructor' | 'student'
export type RoleType = (typeof ROLE)[keyof typeof ROLE];
// value:['admin', 'instructor', 'student']
export const roleList = Object.values(ROLE);

// Route api
export const ROUTES = {
  LOGIN_USER: '/v1/auth/login',
  REGISTER_COMPANY: '/v1/companies/register',
  REGISTER_USER_ADMIN: ' /v1/auth/register/admin',
};
export const COMPANY_PLANS = ['free', 'pro', 'enterprise'] as const; // type
export type CompanyPlan = (typeof COMPANY_PLANS)[number]; // ['free', 'pro', 'enterprise']

// locales
export const LOCALES = ['en-US', 'zh-CN'] as const;
export const DEFAULT_LOCALE = LOCALES[0];
// all timezone
export const TIMEZONES: string[] = moment.tz.names();

export default config;
