import { Request, Response, NextFunction } from 'express';
import { AppError } from '../error/AppError';
import { userService } from '../services/userService';

export const userController = {
  // Get all users
  getAllUsers: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const users = await userService.getAllUsers();
      res.status(200).json({
        success: true,
        count: users.length,
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
      const user = await userService.getUserById(userId);
      
      if (!user) {
        return next(new AppError('User not found', 404));
      }
      
      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  },

  // Create new user
  createUser: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userData = req.body;
      const user = await userService.createUser(userData);
      
      res.status(201).json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  },

  // Update user
  updateUser: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.params.id;
      const userData = req.body;
      const user = await userService.updateUser(userId, userData);
      
      if (!user) {
        return next(new AppError('User not found', 404));
      }
      
      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  },

  // Delete user
  deleteUser: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.params.id;
      const user = await userService.deleteUser(userId);
      
      if (!user) {
        return next(new AppError('User not found', 404));
      }
      
      res.status(200).json({
        success: true,
        data: {},
      });
    } catch (error) {
      next(error);
    }
  },
};
