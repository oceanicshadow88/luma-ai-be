import { Request, Response, NextFunction } from 'express';
import { userService } from '../services/userService';
import ValidationException from '../exceptions/validationException';

export const userController = {
  // Get all users
  getAllUsers: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const q = req.query.q as string | undefined;

      const users = await userService.getAllUsers(page, limit, q);

      res.json({
        success: true,
        data: users,
      });
    } catch (error) {
      next(error);
    }
  },
  // Get single user
  getUserById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.params.id;

      if (!userId) {
        next(new ValidationException('User ID is required'));
        return;
      }

      const user = await userService.getUserById(userId);

      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  },

  // Update user
  updateUserById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.params.id;
      if (!userId) {
        next(new ValidationException('User ID is required'));
        return;
      }

      const user = await userService.updateUserById(userId, req.body);
      res.json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  },

  // Delete user
  deleteUserById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.params.id;
      if (!userId) {
        next(new ValidationException('User ID is required'));
        return;
      }

      await userService.deleteUserById(userId);

      res.status(204);
    } catch (error) {
      next(error);
    }
  },
};
