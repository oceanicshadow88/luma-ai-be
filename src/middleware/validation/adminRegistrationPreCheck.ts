import { Request, Response, NextFunction } from 'express';
import { getSafePendingUserData, setPendingUserData } from '../../utils/storagePendingUser';
import { RegisterUserInput } from '../../controllers/auth/registerController';
import { userService } from '../../services/userService';
import { companyService } from '../../services/companyService';
import { checkVerificationCode } from '../../services/auth/registerService';

export const adminRegistrationPreCheck = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { email, username, verifyCode } = req.body;
  if (verifyCode) {
    await checkVerificationCode(verifyCode, email);
  }

  // check user with company exist
  await userService.checkUserExist(email, username);

  // check company
  const existCompany = await companyService.getCompanybyWorkEmail(email);
  if (!existCompany) {
    // company not exist, jump to company register and pass user data
    const user = req.body as RegisterUserInput;
    setPendingUserData(user);

    res.status(302).json({
      message: 'The company does not exist',
      user: getSafePendingUserData(),
    });
    return;
  }

  // company exist, user not exist
  next();
};
