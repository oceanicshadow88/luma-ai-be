import { Request, Response } from 'express';
import { membershipService } from '../services/membershipService';

export const membershipController = {
  createMembership: async (req: Request, res: Response) => {

    const { companyId, userId, role, status } = req.body;
    const membership = await membershipService.createMembership({
      companyId,
      userId,
      role,
      status,
    });
    res.status(201).json(membership);

  },

  getMembershipsByCompany: async (req: Request, res: Response) => {

    const companyId = req.params.companyId;
    if (!companyId) {
      return res.status(400).json({ message: 'Company ID is required' });
    }
    const memberships = await membershipService.getMembershipsByCompany(companyId);
    res.json(memberships);

  },

  getMembershipsByUser: async (req: Request, res: Response) => {

    const userId = req.params.userId;
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }
    const memberships = await membershipService.getMembershipsByUser(userId);
    res.json(memberships);

  },

  updateMembership: async (req: Request, res: Response) => {

    const id = req.params.id;
    if (!id) {
      return res.status(400).json({ message: 'Membership ID is required' });
    }
    const { role, status } = req.body;
    const membership = await membershipService.updateMembership(id, { role, status });
    if (!membership) {
      return res.status(404).json({ message: 'Membership not found' });
    }

  },

  deleteMembership: async (req: Request, res: Response) => {

    const id = req.params.id;
    if (!id) {
      return res.status(400).json({ message: 'Membership ID is required' });
    }
    const membership = await membershipService.deleteMembership(id);
    if (!membership) {
      return res.status(404).json({ message: 'Membership not found' });
    }
    res.status(204).send();

  },

  getCurrentUserMemberships: async (req: Request, res: Response) => {

    const memberships = await membershipService.getMembershipsByUser(req.user?._id || '');
    res.json(memberships);

  },

  acceptInvite: async (req: Request, res: Response) => {

    const { token } = req.params;
    if (!token) {
      return res.status(400).json({ message: 'Token is required' });
    }
    const result = await membershipService.acceptInvite(token);
    res.json(result);

  },
};
