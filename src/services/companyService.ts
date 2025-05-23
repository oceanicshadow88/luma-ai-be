import mongoose from 'mongoose';
import CompanyModel, { Company } from '../models/company';
import AppException from '../exceptions/appException';
import { HttpStatusCode } from 'axios';
import { CompanyPlan } from '../config';

interface CompanyInput {
  companyName: string;
  slug: string;
  plan: CompanyPlan;
  ownerId: mongoose.Types.ObjectId;
  settings?: {
    timezone?: string;
    locale?: string;
    logoUrl?: string;
    primaryColor?: string;
  };
}

export const companyService = {
  createCompany: async (companyInput: CompanyInput): Promise<Company> => {
    const { companyName, slug, plan, ownerId, settings } = companyInput;

    // check conflict
    const existCompany = await CompanyModel.findOne({ slug });
    if (existCompany) {
      throw new AppException(HttpStatusCode.Conflict, 'Company already exists');
    }
    const ownedCompany = await CompanyModel.findOne({ ownerId });
    if (ownedCompany) {
      throw new AppException(HttpStatusCode.Conflict, 'Owner already has a company');
    }

    return CompanyModel.create({
      companyName,
      slug,
      plan,
      ownerId,
      settings,
    });
  },
};
