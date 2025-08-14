import AppException from '@src/exceptions/appException';
import { adminDashboardDataMock } from '@src/mockData/adminDashboardDataMock';
import { companyUsageService } from '@src/services/companyUsageService';
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

    // const currentUserInfo = await userService.getCurrentUserInfo(req.user.id, req.companyId);

    //TODO: mock data for dashboard display(replace later)
    const dashboardData = {
      // currentUserInfo,
      totalLearners: companyUsage.currentLearners,
      totalInstructors: companyUsage.currentInstructors,
      adminDashboardDataMock,
    };

    res.status(200).json({ success: true, data: dashboardData });
  },
};
