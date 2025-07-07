import AppException from '@src/exceptions/appException';
import { adminDashboardDataMock, DEFAULT_MOCK_COUNT } from '@src/mockData/adminDashboardDataMock';
import { companyUsageService } from '@src/services/companyUsageService';
import { userService } from '@src/services/userService';
import { HttpStatusCode } from 'axios';
import { Request, Response } from 'express';

export const dashboardController = {
  getAdminDashboard: async (req: Request, res: Response) => {
    if (!req.user?.id) {
      throw new AppException(HttpStatusCode.InternalServerError, 'Unauthorized User');
    }
    if (!req.companyId) {
      throw new AppException(HttpStatusCode.InternalServerError, 'Missing company');
    }

    const companyUsage = await companyUsageService.upsertCompanyUsage(req.companyId);

    const currentUserInfo = await userService.getCurrentUserInfo(req.user.id, req.companyId);

    //mock data for dashboard display(replace later)
    const dashboardData = {
      currentUserInfo,
      totalLearners: companyUsage?.currentLearners ?? DEFAULT_MOCK_COUNT,
      totalInstructors: companyUsage?.currentInstructors ?? DEFAULT_MOCK_COUNT,
      adminDashboardDataMock,
    };

    res.status(200).json({ success: true, data: dashboardData });
  },
};
