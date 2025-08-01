export const companyUsageService = {
  upsertCompanyUsage: async (companyId: string) => {
    // const [learnerCount, instructorCount] = await Promise.all([
    //   membershipService.countRolesInCompany(companyId, ROLE.LEARNER),
    //   membershipService.countRolesInCompany(companyId, ROLE.INSTRUCTOR),
    // ]);
    // const updatedUsage = await CompanyUsageModel.findOneAndUpdate(
    //   { company: companyId },
    //   {
    //     $set: {
    //       currentLearners: learnerCount,
    //       currentInstructors: instructorCount,
    //     },
    //   },
    //   { upsert: true, new: true },
    // );
    // return updatedUsage;
  },
};
