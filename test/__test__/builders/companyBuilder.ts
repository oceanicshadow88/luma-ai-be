import type { Document } from 'mongoose';
import { Types } from 'mongoose';

import {
  type CompanyPlanType,
  DEFAULT_COMPANY_PLAN,
  DEFAULT_LOCALE,
  DEFAULT_TIMEZONE,
  type LocaleType,
} from '../../../src/config';
import CompanyModel, { type Company } from '../../../src/models/company';

export interface CompanyDocument extends Document, Company {
  _id: string;
}

class CompanyBuilder {
  private company: Partial<Company>;

  constructor() {
    this.company = {
      companyName: 'Default Company',
      slug: 'lumaai',
      plan: DEFAULT_COMPANY_PLAN,
      owner: new Types.ObjectId(),
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
    this.company.owner = new Types.ObjectId(owner);
    return this;
  }

  withLogoUrl(logoUrl: string): CompanyBuilder {
    this.company.logoUrl = logoUrl;
    return this;
  }

  withSettings(settings: Partial<Company['settings']>): CompanyBuilder {
    this.company.settings = { ...this.company.settings, ...settings };
    return this;
  }

  withTimezone(timezone: string): CompanyBuilder {
    if (!this.company.settings) {
      this.company.settings = {};
    }
    this.company.settings.timezone = timezone;
    return this;
  }

  withLocale(locale: LocaleType): CompanyBuilder {
    if (!this.company.settings) {
      this.company.settings = {};
    }
    this.company.settings.locale = locale;
    return this;
  }

  withPrimaryColor(primaryColor: string): CompanyBuilder {
    if (!this.company.settings) {
      this.company.settings = {};
    }
    this.company.settings.primaryColor = primaryColor;
    return this;
  }

  withStatus(active: boolean): CompanyBuilder {
    this.company.active = active;
    return this;
  }

  build(): Partial<Company> {
    return this.company;
  }

  async save(): Promise<CompanyDocument> {
    const savedCompany = await new CompanyModel(this.company).save();
    return savedCompany as unknown as CompanyDocument;
  }
}

export default CompanyBuilder;
