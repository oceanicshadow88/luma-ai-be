import mongoose from 'mongoose';
import CompanyModel, { Company } from '../models/company';
import AppException from '../exceptions/appException';
import { HttpStatusCode } from 'axios';
import { CompanyPlanType, LocaleType } from '../config';
import UserModel from '../models/user';

export interface CompanyCreateInput {
  companyName: string;
  slug: string;
  plan?: CompanyPlanType;
  owner: mongoose.Types.ObjectId;
  settings?: {
    timezone?: string;
    locale?: LocaleType;
    logoUrl?: string;
    primaryColor?: string;
  };
}

export const companyService = {
  createCompany: async (companyInput: CompanyCreateInput): Promise<Company> => {
    // Check conflict
    const existCompany = await CompanyModel.findOne({ slug: companyInput.slug });
    if (existCompany) {
      throw new AppException(HttpStatusCode.Conflict, 'Company already exists');
    }
    const existOwner = await UserModel.exists({ _id: companyInput.owner });
    if (!existOwner) {
      throw new AppException(HttpStatusCode.BadRequest, 'Owner user not found');
    }
    const ownedCompany = await CompanyModel.findOne({ owner: companyInput.owner });
    if (ownedCompany) {
      throw new AppException(HttpStatusCode.Conflict, 'Owner already has a company');
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
};
