/// <reference types="jest" />

import type { Document } from 'mongoose';

import {
  type CompanyPlanType,
  DEFAULT_COMPANY_PLAN,
  DEFAULT_LOCALE,
  DEFAULT_TIMEZONE,
} from '../../../src/config';
import CompanyModel from '../../../src/models/company';

export interface CompanySettings {
  timezone: string;
  locale: string;
  primaryColor: string;
}

export interface CompanyData {
  companyName: string;
  slug: string;
  plan: CompanyPlanType;
  owner: string | null;
  logoUrl: string;
  settings: CompanySettings;
  active: boolean;
}

export interface CompanyDocument extends Document, CompanyData {
  _id: string;
}

class CompanyBuilder {
  private company: CompanyData;

  constructor() {
    this.company = {
      companyName: 'Default Company',
      slug: 'lumaai',
      plan: DEFAULT_COMPANY_PLAN,
      owner: null,
      logoUrl: '',
      settings: {
        timezone: DEFAULT_TIMEZONE || 'UTC',
        locale: DEFAULT_LOCALE,
        primaryColor: '#000000',
      },
      active: true,
    };
  }

  withCompanyName(companyName: string): CompanyBuilder {
    this.company.companyName = companyName;
    return this;
  }

  withSlug(slug: string): CompanyBuilder {
    this.company.slug = slug;
    return this;
  }

  withPlan(plan: CompanyPlanType): CompanyBuilder {
    this.company.plan = plan;
    return this;
  }

  withOwner(owner: string): CompanyBuilder {
    this.company.owner = owner;
    return this;
  }

  withLogoUrl(logoUrl: string): CompanyBuilder {
    this.company.logoUrl = logoUrl;
    return this;
  }

  withSettings(settings: Partial<CompanySettings>): CompanyBuilder {
    this.company.settings = { ...this.company.settings, ...settings };
    return this;
  }

  withTimezone(timezone: string): CompanyBuilder {
    this.company.settings.timezone = timezone;
    return this;
  }

  withLocale(locale: string): CompanyBuilder {
    this.company.settings.locale = locale;
    return this;
  }

  withPrimaryColor(primaryColor: string): CompanyBuilder {
    this.company.settings.primaryColor = primaryColor;
    return this;
  }

  withActive(active: boolean): CompanyBuilder {
    this.company.active = active;
    return this;
  }

  build(): CompanyData {
    return this.company;
  }

  async save(): Promise<CompanyDocument> {
    const savedCompany = await new CompanyModel(this.company).save();
    return savedCompany as unknown as CompanyDocument;
  }
}

export default CompanyBuilder;
