import { Request, Response } from 'express';
import { userService } from '../services/userService';
import AppException from '../exceptions/appException';
import { HttpStatusCode } from 'axios';

export const userController = {
  deleteUser: async (req: Request, res: Response) => {
    const { userId } = req.params;
    if (!userId) {
      throw new AppException(HttpStatusCode.BadRequest, 'Missing userId parameter');
    }

    await userService.deleteUserById(userId);
    return res.status(200).json({ message: 'User and related memberships deleted' });
  },
};
