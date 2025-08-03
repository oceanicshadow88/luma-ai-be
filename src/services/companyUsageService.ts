import { ROLE } from '../config';
import CompanyUsageModel from '../models/companyUsage';
import UserModel from '../models/user';

export const companyUsageService = {
  upsertCompanyUsage: async (companyId: string) => {
    const [learnerCount, instructorCount] = await Promise.all([
      UserModel.countDocuments({ company: companyId, role: ROLE.LEARNER }),
      UserModel.countDocuments({ company: companyId, role: ROLE.INSTRUCTOR }),
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
