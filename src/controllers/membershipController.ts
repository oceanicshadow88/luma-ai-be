import { Request, Response } from 'express';
import { membershipService } from '../services/membershipService';

export const membershipController = {
  createMembership: async (req: Request, res: Response) => {
    try {
      const { companyId, userId, role, status } = req.body;
      const membership = await membershipService.createMembership({
        companyId,
        userId,
        role,
        status,
      });
      res.status(201).json(membership);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  },

  getMembershipsByCompany: async (req: Request, res: Response) => {
    try {
      const companyId = req.params.companyId;
      if (!companyId) {
        return res.status(400).json({ message: 'Company ID is required' });
      }
      const memberships = await membershipService.getMembershipsByCompany(companyId);
      res.json(memberships);
    } catch {
      res.status(500).json({ message: 'Internal server error' });
    }
  },

  getMembershipsByUser: async (req: Request, res: Response) => {
    try {
      const userId = req.params.userId;
      if (!userId) {
        return res.status(400).json({ message: 'User ID is required' });
      }
      const memberships = await membershipService.getMembershipsByUser(userId);
      res.json(memberships);
    } catch {
      res.status(500).json({ message: 'Internal server error' });
    }
  },

  updateMembership: async (req: Request, res: Response) => {
    try {
      const id = req.params.id;
      if (!id) {
        return res.status(400).json({ message: 'Membership ID is required' });
      }
      const { role, status } = req.body;
      const membership = await membershipService.updateMembership(id, { role, status });
      if (!membership) {
        return res.status(404).json({ message: 'Membership not found' });
      }
      res.json(membership);
    } catch {
      res.status(500).json({ message: 'Internal server error' });
    }
  },

  deleteMembership: async (req: Request, res: Response) => {
    try {
      const id = req.params.id;
      if (!id) {
        return res.status(400).json({ message: 'Membership ID is required' });
      }
      const membership = await membershipService.deleteMembership(id);
      if (!membership) {
        return res.status(404).json({ message: 'Membership not found' });
      }
      res.status(204).send();
    } catch {
      res.status(500).json({ message: 'Internal server error' });
    }
  },

  getCurrentUserMemberships: async (req: Request, res: Response) => {
    try {
      const memberships = await membershipService.getMembershipsByUser(req.user?._id || '');
      res.json(memberships);
    } catch {
      res.status(500).json({ message: 'Internal server error' });
    }
  },

  acceptInvite: async (req: Request, res: Response) => {
    try {
      const { token } = req.params;
      if (!token) {
        return res.status(400).json({ message: 'Token is required' });
      }
      const result = await membershipService.acceptInvite(token);
      res.json(result);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  },
};
