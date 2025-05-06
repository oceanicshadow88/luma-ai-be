import Company from '../models/company';
import { Types } from 'mongoose';

interface CompanyInput {
  name: string;
  plan: string;
  ownerId: string;
  settings?: {
    timezone?: string;
    locale?: string;
    logoUrl?: string;
    primaryColor?: string;
  };
  active?: boolean;
}

interface CompanyUpdate {
  name?: string;
  plan?: string;
  settings?: {
    timezone?: string;
    locale?: string;
    logoUrl?: string;
    primaryColor?: string;
  };
  active?: boolean;
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
      settings,
    });

    return company;
  },

  getCompanyById: async (id: string) => {
    return await Company.findById(id);
  },

  getCompaniesByOwnerId: async (ownerId: string) => {
    return await Company.find({ ownerId });
  },

  updateCompany: async (id: string, data: CompanyUpdate) => {
    const { name } = data;
    if (name) {
      const existing = await Company.findOne({ name, _id: { $ne: id } });
      if (existing) {
        throw new Error('Company name already exists');
      }
    }
    return await Company.findByIdAndUpdate(
      id,
      { ...data, ...(name && { slug: name.toLowerCase().replace(/\s+/g, '-') }) },
      { new: true }
    );
  },

  deleteCompany: async (id: string) => {
    return await Company.findByIdAndDelete(id);
  },
};
