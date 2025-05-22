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
}

export const companyService = {};
