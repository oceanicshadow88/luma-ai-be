import { Request, Response } from 'express';

import { userService } from '../services/userService';

export const adminDashboardController = {
  getAdminDashboardData: async (req: Request, res: Response) => {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    if (!req.companyId) {
      return res.status(401).json({ success: false, message: 'Missing company' });
    }

    const currentUserInfo = await userService.getCurrentUserInfo(req.user.id, req.companyId);

    const dashboardData = {
      currentUserInfo,
    };

    res.status(200).json({ success: true, data: dashboardData });
  },
};
