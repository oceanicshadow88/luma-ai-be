import { CompanyPlanType, LocaleType } from '@src/types/constants';
import { HttpStatusCode } from 'axios';
import mongoose from 'mongoose';

import AppException from '../exceptions/appException';
import CompanyModel, { Company } from '../models/company';
import UserModel from '../models/user';

export interface CompanyCreateInput {
  companyName: string;
  slug: string;
  plan?: CompanyPlanType;
  owner: mongoose.Types.ObjectId;
  logoUrl?: string;
  settings?: {
    timezone?: string;
    locale?: LocaleType;
    primaryColor?: string;
  };
}

export const companyService = {
  createCompany: async (companyInput: CompanyCreateInput): Promise<Company> => {
    // Check conflict
    const existCompanyName = await CompanyModel.findOne({ companyName: companyInput.companyName });
    if (existCompanyName) {
      throw new AppException(HttpStatusCode.Conflict, 'Company already exists');
    }

    const existCompanySlug = await CompanyModel.findOne({ slug: companyInput.slug });
    if (existCompanySlug) {
      throw new AppException(HttpStatusCode.Conflict, 'Organisation Slug already exists');
    }
    const existOwner = await UserModel.exists({ _id: companyInput.owner });
    if (!existOwner) {
      throw new AppException(HttpStatusCode.InternalServerError, 'Owner user not found');
    }
    const ownedCompany = await CompanyModel.findOne({ owner: companyInput.owner });
    if (ownedCompany) {
      throw new AppException(HttpStatusCode.InternalServerError, 'Owner already has a company');
    }

    // create company
    return await CompanyModel.create(companyInput);
  },

  deleteCompanyById: async (companyId: string) => {
    const company = await CompanyModel.findById(companyId);
    if (!company) throw new AppException(HttpStatusCode.BadRequest, 'Company not found');
    await company.deleteOne(); //Trigger pre deleteOne hook, also delete membership
    return true;
  },

  getCompanyBySlug: async (slug: string) => {
    const existCompany = await CompanyModel.findOne({ slug }).lean();
    if (!existCompany) {
      return false;
    }
    return existCompany;
  },
};
