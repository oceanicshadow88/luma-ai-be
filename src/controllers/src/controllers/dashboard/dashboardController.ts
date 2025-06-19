import { Request, Response } from 'express';

import { adminDashboardDataMock } from '../../../../mockdata/src/mockData/adminDashboardDataMock';
import { companyUsageService } from '../../../../services/companyUsageService';
import { userService } from '../../../../services/userService';

const DEFAULT_MOCK_COUNT = 666;

export const adminDashboardController = {
  getAdminDashboardData: async (req: Request, res: Response) => {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    const currentUserInfo = await userService.getCurrentUserInfo(req.user.id);

    const companyId = currentUserInfo?.enterprise.id;
    const companyUsage = await companyUsageService.upsertCompanyUsage(companyId);
    const totalLearners = companyUsage?.currentLearners ?? DEFAULT_MOCK_COUNT;
    const totalInstructors = companyUsage?.currentInstructors ?? DEFAULT_MOCK_COUNT;

    const dashboardData = {
      currentUserInfo,
      totalLearners,
      totalInstructors,
      roadmapsCreated: DEFAULT_MOCK_COUNT,
      quizzesCreated: DEFAULT_MOCK_COUNT,
      adminDashboardDataMock,
    };

    res.status(200).json({ success: true, data: dashboardData });
  },
};
