import { ROLES } from '@src/config/constants';

import CompanyUsageModel from '../models/companyUsage';
import UserModel from '../models/user';

export const companyUsageService = {
  upsertCompanyUsage: async (companyId: string) => {
    const [learnerCount, instructorCount] = await Promise.all([
      UserModel.countDocuments({ company: companyId, role: ROLES.LEARNER }),
      UserModel.countDocuments({ company: companyId, role: ROLES.INSTRUCTOR }),
    ]);

    const updatedUsage = await CompanyUsageModel.findOneAndUpdate(
      { company: companyId },
      {
        $set: {
          currentLearners: learnerCount,
          currentInstructors: instructorCount,
        },
      },
      { upsert: true, new: true },
    );

    return updatedUsage;
  },
};
