import UnauthorizedException from '../exceptions/unauthorizedException';
import UserModel, { IUser } from '../models/user';

export const userService = {
  // Get all users
  getAllUsers: async (page: number, limit: number, q?: string) => {
    const query = q ? { $text: { $search: q } } : {};
    const skip = (page - 1) * limit;

    const users = await UserModel.find(query).skip(skip).limit(limit).select('-password').exec();

    if (!users.length) {
      throw new UnauthorizedException('User not found');
    }
    return users;
  },

  // Get user by ID
  getUserById: async (userId: string) => {
    const user = await UserModel.findOne({ _id: userId });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return user;
  },

  // Update user
  updateUserById: async (userId: string, updates: Partial<IUser>) => {
    const user = await UserModel.findOne({ _id: userId });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    user.set(updates);
    await user.save();

    return user;
  },

  // Delete user
  deleteUserById: async (userId: string) => {
    // find user
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return await user.deleteOne();
  },
};
