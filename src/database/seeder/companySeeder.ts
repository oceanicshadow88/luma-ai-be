import { DEFAULT_COMPANY_PLAN, DEFAULT_LOCALE, DEFAULT_TIMEZONE } from '@src/types/constants';

import Company from '../../models/company';
import { User } from '../../models/user';

export const companySeeder = {
  async seedDefault(owner: User) {
    const existing = await Company.findOne({ slug: 'default-company' });
    if (existing) {
      return;
    }

    const newCompany = await Company.create({
      companyName: 'Default Company',
      slug: 'default-company',
      plan: DEFAULT_COMPANY_PLAN,
      owner: owner._id,
      logoUrl: '',
      settings: {
        timezone: DEFAULT_TIMEZONE,
        locale: DEFAULT_LOCALE,
        primaryColor: '#2196f3',
      },
      active: true,
    });
    return newCompany;
  },
};
