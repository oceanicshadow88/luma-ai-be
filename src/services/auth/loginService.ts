import UserModel from '../../models/user';
import AppException from '../../exceptions/appException';
import { HttpStatusCode } from 'axios';
import { ROUTES } from '../../config';

export const loginService = {
  adminLogin: async ({ email, password }: { email: string; password: string }) => {
    // check user exist
    const user = await UserModel.findOne({ email });
    if (!user) {
      throw new AppException(HttpStatusCode.NotFound, 'Invalid credentials.'
      );
    }
    // verify password
    const isValidPassword = await user.validatePassword(password);
    if (!isValidPassword) {
      throw new AppException(HttpStatusCode.Unauthorized, 'Invalid credentials');
    }

    // generate token
    const { refreshToken, accessToken } = await user.generateTokens();

    // save refreshToken
    user.refreshToken = refreshToken;
    await user.save();
    // get user all roles

    return { refreshToken, accessToken };
  },
};
