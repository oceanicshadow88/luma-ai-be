import UserModel from '../../models/user';

export const logoutService = {
  logoutUser: async (refreshToken: string) => {
    const user = await UserModel.findOne({ refreshToken });

    if (user) {
      user.refreshToken = undefined;
      await user.save();
    }
  },
};
