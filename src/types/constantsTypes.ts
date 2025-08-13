import { COMPANY_PLANS, LOCALES, ROLES } from '@src/types/constants';

export type CompanyPlanType = (typeof COMPANY_PLANS)[keyof typeof COMPANY_PLANS];
export type LocaleType = (typeof LOCALES)[keyof typeof LOCALES];
export type RoleType = (typeof ROLES)[keyof typeof ROLES];
