import { Request, Response } from 'express';

import { adminDashboardDataMock, DEFAULT_MOCK_COUNT } from '../mockData/adminDashboardDataMock';
import { companyUsageService } from '../services/companyUsageService';

export const dashboardController = {
  getAdminDashboardData: async (req: Request, res: Response) => {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    if (!req.companyId) {
      return res.status(401).json({ success: false, message: 'Missing company' });
    }

    const companyUsage = await companyUsageService.upsertCompanyUsage(req.companyId);

    const dashboardData = {
      currentUserInfo: '',
      totalLearners: companyUsage?.currentLearners ?? DEFAULT_MOCK_COUNT,
      totalInstructors: companyUsage?.currentInstructors ?? DEFAULT_MOCK_COUNT,
      adminDashboardDataMock,
    };

    res.status(200).json({ success: true, data: dashboardData });
  },
};
