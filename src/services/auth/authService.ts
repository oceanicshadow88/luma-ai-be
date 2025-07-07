import { HttpStatusCode } from 'axios';

import AppException from '../../exceptions/appException';
import { jwtUtils } from '../../lib/jwtUtils';
import UserModel from '../../models/user';

export const authService = {
  verifyToken: async (token: string) => {
    const payload = jwtUtils.verifyAccessToken(token);
    const user = await UserModel.find({ email: payload?.email });
    if (!user) {
      throw new AppException(HttpStatusCode.Forbidden, 'Unauthorized Access', {
        payload: `User not exist with this token email: ${payload?.email}`,
      });
    }
    return user;
  },
};
