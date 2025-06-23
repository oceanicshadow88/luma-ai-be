import { Request, Response } from 'express';

import { adminDashboardDataMock, DEFAULT_MOCK_COUNT } from '../mockData/adminDashboardDataMock';

export const dashboardController = {
  getAdminDashboard: async (req: Request, res: Response) => {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, message: 'Unauthorized User' });
    }
    if (!req.companyId) {
      return res.status(401).json({ success: false, message: 'Missing company' });
    }
    const dashboardData = {
      currentUserInfo: '',
      totalLearners: DEFAULT_MOCK_COUNT,
      totalInstructors: DEFAULT_MOCK_COUNT,
      adminDashboardDataMock,
    };

    res.status(200).json({ success: true, data: dashboardData });
  },
};
