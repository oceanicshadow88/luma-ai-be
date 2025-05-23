import { Request, Response, NextFunction } from 'express';

interface CreateCompanyInput {
  name: string;
  plan: string;
  ownerId?: string;
  settings?: {
    timezone?: string;
    locale?: string;
    logoUrl?: string;
    primaryColor?: string;
  };
}

export const companyController = {
  createCompany: async (req: Request, res: Response, next: NextFunction) => {

    const { name, plan, ownerId: ownerFromBody, settings }: CreateCompanyInput = req.body;

  },

};
