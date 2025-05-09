import { Request, Response } from 'express';
import { tokenService } from '../services/tokenService';

export const tokenController = {
  getValidToken: async (req: Request, res: Response) => {
    try {
      const { token, type } = req.body;
      const validToken = await tokenService.getValidToken(token, type);
      if (!validToken) {
        return res.status(404).json({ message: 'Token not found or expired' });
      }
      res.json(validToken);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  },

  invalidateToken: async (req: Request, res: Response) => {
    try {
      const { token } = req.body;
      await tokenService.invalidateToken(token);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}; 