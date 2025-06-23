import { Request, Response } from 'express';

export const dashboardController = {
  getAdminDashboard: async (req: Request, res: Response) => {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, message: 'Unauthorized User' });
    }
    if (!req.companyId) {
      return res.status(401).json({ success: false, message: 'Missing company' });
    }

    res.status(200).json({ success: true, data: ' Dashboard' });
  },
};
