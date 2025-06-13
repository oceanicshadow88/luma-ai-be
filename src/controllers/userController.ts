import AppException from '@src/exceptions/appException';
import { userService } from '@src/services/userService';
import { HttpStatusCode } from 'axios';
import { Request, Response } from 'express';

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
