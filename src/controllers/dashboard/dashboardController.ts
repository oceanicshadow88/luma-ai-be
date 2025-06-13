import config from '@src/config';
import { mockAdminDashboardData } from '@src/mockData/adminDashboardDataMock';
import { companyUsageService } from '@src/services/companyUsageService';
import { userService } from '@src/services/userService';
import { Request, Response } from 'express';

export const adminDashboardController = {
  getAdminDashboardData: async (req: Request, res: Response) => {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    const currentUserInfo = await userService.getCurrentUserInfo(req.user.id);

    const companyId = currentUserInfo?.enterprise.id;
    const companyUsage = await companyUsageService.upsertCompanyUsage(companyId);
    const totalLearners = companyUsage?.currentLearners ?? config.DEFAULT_MOCK_COUNT;
    const totalInstructors = companyUsage?.currentInstructors ?? config.DEFAULT_MOCK_COUNT;

    const dashboardData = {
      currentUserInfo,
      totalLearners,
      totalInstructors,
      roadmapsCreated: config.DEFAULT_MOCK_COUNT,
      quizzesCreated: config.DEFAULT_MOCK_COUNT,
      mockAdminDashboardData,
    };

    res.status(200).json({ success: true, data: dashboardData });
  },
};
