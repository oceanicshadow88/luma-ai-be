import UserModel from '../../models/user';
import AppException from '../../exceptions/appException';
import { generateTokenByUser } from '../../utils/token';
import { HttpStatusCode } from 'axios';
import { ROUTES } from '../../config';

export const loginService = {
  adminLogin: async ({ email, password }: { email: string; password: string }) => {
    // check user exist
    const user = await UserModel.findOne({ email });

    if (!user) {
      throw new AppException(
        HttpStatusCode.NotFound,
        'User not found. Redirect to admin register.',
        {
          payload: { redirectTo: ROUTES.REGISTER_USER_ADMIN },
        },
      );
    }
    // verify password
    const isValidPassword = await user.validatePassword(password);
    if (!isValidPassword) {
      throw new AppException(HttpStatusCode.Unauthorized, 'Invalid credentials');
    }

    // generate token
    const { refreshToken, accessToken } = await generateTokenByUser(user);

    // save refreshToken
    user.refreshToken = refreshToken;
    await user.save();

    return { refreshToken, accessToken };
  },
};
