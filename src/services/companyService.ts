import Company from '../models/Company';
import { Types } from 'mongoose';

interface CompanyInput {
  name: string;
  plan: string;
  ownerId: string;
  settings: {
    timezone?: string;
    locale?: string;
    logoUrl?: string;
    primaryColor?: string;
  };
}

export const companyService = {
  createCompany: async (data: CompanyInput) => {
    const { name, plan, ownerId, settings } = data;

    // Check if company name exists
    const existing = await Company.findOne({ name });
    if (existing) {
      throw new Error('Company name already exists');
    }

    // Create new company
    const company = await Company.create({
      name,
      slug: name.toLowerCase().replace(/\s+/g, '-'),
      plan,
      ownerId: new Types.ObjectId(ownerId),
      settings: {
        timezone: settings.timezone || 'UTC',
        locale: settings.locale || 'en-US',
        logoUrl: settings.logoUrl || '',
        primaryColor: settings.primaryColor || '#000000',
      },
    });

    return company;
  },

  getCompanyById: async (id: string) => {
    return await Company.findById(id);
  },

  getCompaniesByOwnerId: async (ownerId: string) => {
    return await Company.find({ ownerId });
  },
};
