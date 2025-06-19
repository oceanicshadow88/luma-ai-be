import { ROLE } from '../config';
import CompanyUsageModel from '../models/companyUsage';
import { membershipService } from './membershipService';

export const companyUsageService = {
  upsertCompanyUsage: async (companyId: string) => {
    const [learnerCount, instructorCount] = await Promise.all([
      membershipService.countRolesInCompany(companyId, ROLE.LEARNER),
      membershipService.countRolesInCompany(companyId, ROLE.INSTRUCTOR),
    ]);

    const updatedUsage = await CompanyUsageModel.findOneAndUpdate(
      { companyId },
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
