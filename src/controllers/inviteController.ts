import { Request, Response } from 'express';
import { inviteService } from '../services/inviteService';

export const inviteController = {
  createInvite: async (req: Request, res: Response) => {
    try {
      const { companyId, email, role } = req.body;
      const invite = await inviteService.createInvite({
        companyId,
        email,
        role
      });
      res.status(201).json(invite);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  },

  acceptInvite: async (req: Request, res: Response) => {
    try {
      const { token } = req.params;
      if (!token) {
        return res.status(400).json({ message: 'Token is required' });
      }
      const invite = await inviteService.acceptInvite(token);
      res.json(invite);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  },

  getActiveInvites: async (req: Request, res: Response) => {
    try {
      const { companyId } = req.params;
      if (!companyId) {
        return res.status(400).json({ message: 'Company ID is required' });
      }
      const invites = await inviteService.getActiveInvites(companyId);
      res.json(invites);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}; 