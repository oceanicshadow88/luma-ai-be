import { Request, Response, NextFunction } from 'express';
import { userService } from '../services/userService';
import notFoundError from '../middleware/error/notFoundError';
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

  //   // Create new user
  //   createUser: async (req: Request, res: Response, next: NextFunction) => {
  //     try {
  //       const userData = req.body;
  //       const user = await userService.createUser(userData);

  //       res.status(201).json({
  //         success: true,
  //         data: user,
  //       });
  //     } catch (error) {
  //       next(error);
  //     }
  //   },

  //   // Update user
  //   updateUser: async (req: Request, res: Response, next: NextFunction) => {
  //     try {
  //       const userId = req.params.id;

  //       if (!userId) {
  //         return next(new AppError('User ID is required', 400));
  //       }

  //       const userData = req.body;
  //       const user = await userService.updateUser(userId, userData);

  //       if (!user) {
  //         return next(new AppError('User not found', 404));
  //       }

  //       res.status(200).json({
  //         success: true,
  //         data: user,
  //       });
  //     } catch (error) {
  //       next(error);
  //     }
  //   },

  //   // Delete user
  //   deleteUser: async (req: Request, res: Response, next: NextFunction) => {
  //     try {
  //       const userId = req.params.id;

  //       if (!userId) {
  //         return next(new AppError('User ID is required', 400));
  //       }

  //       const user = await userService.deleteUser(userId);

  //       if (!user) {
  //         return next(new AppError('User not found', 404));
  //       }

  //       res.status(200).json({
  //         success: true,
  //         data: {},
  //       });
  //     } catch (error) {
  //       next(error);
  //     }
  //   },
};
