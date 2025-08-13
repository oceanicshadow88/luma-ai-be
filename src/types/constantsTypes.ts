import { COMPANY_PLANS, LOCALES, ROLE } from '@src/config/constants';

export type CompanyPlanType = (typeof COMPANY_PLANS)[keyof typeof COMPANY_PLANS];
export type LocaleType = (typeof LOCALES)[keyof typeof LOCALES];
export type RoleType = (typeof ROLE)[keyof typeof ROLE];
