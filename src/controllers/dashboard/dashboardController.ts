import { Request, Response } from 'express';
import { userService } from '../../services/userService';
import { membershipService } from '../../services/membershipService';
import config from '../../config';

export const adminDashboardController = {
  getAdminDashboardData: async (req: Request, res: Response) => {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    const currentUserInfo = await userService.getCurrentUserInfo(req.user.id);
    const companyId = currentUserInfo?.enterprise.id;

    let totalStudents = await membershipService.countStudentsInCompany(companyId);
    if (!totalStudents) {
      totalStudents = config.DEFAULT_MOCK_COUNT;
    }

    const dashboardData = {
      currentUserInfo,
      totalStudents,
      roadmapsCreated: config.DEFAULT_MOCK_COUNT,
      quizzesCreated: config.DEFAULT_MOCK_COUNT,
    };

    res.status(200).json({ success: true, data: dashboardData });
  },
};
