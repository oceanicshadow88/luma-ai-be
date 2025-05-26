import UserModel from '../../models/user';
import AppException from '../../exceptions/appException';
import { HttpStatusCode } from 'axios';
import { ROUTES } from '../../config';
import { extractCompanySlug } from '../../utils/extractCompanySlugFromEmail';
import CompanyModel from '../../models/company';
import { membershipService } from '../membershipService';
import { getSafePendingUserData, setPendingUserData } from '../../utils/storagePendingUser';

export const loginService = {
  adminLogin: async ({ email, password }: { email: string; password: string }) => {
    // check user exist
    const user = await UserModel.findOne({ email });
    if (!user) {
      throw new AppException(HttpStatusCode.NotFound, 'Invalid credentials.', {
        payload: { redirectTo: ROUTES.REGISTER_USER_ADMIN },
      });
    } // verify password
    const isValidPassword = await user.validatePassword(password);
    if (!isValidPassword) {
      throw new AppException(HttpStatusCode.Unauthorized, 'Invalid credentials');
    }

    // generate token
    const { refreshToken, accessToken } = await user.generateTokens();
    // get company
    const companySlug = await extractCompanySlug(email);
    const company = await CompanyModel.findOne({ slug: companySlug });
    if (!company) {
      // company not exist
      setPendingUserData(user.toObject());

      throw new AppException(HttpStatusCode.NotFound, 'Invalid credentials', {
        payload: { redirectTo: ROUTES.REGISTER_COMPANY, user: getSafePendingUserData() },
      });
    }

    // save refreshToken
    user.refreshToken = refreshToken;
    await user.save();
    // get user all roles
    const roles = await membershipService.getUserRolesCompany(user.id);

    return { refreshToken, accessToken, username: user.username, roles };
  },
};
