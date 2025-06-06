import { Request, Response, NextFunction } from 'express';
import AppException from '../../exceptions/appException';
import { HttpStatusCode } from 'axios';
import CompanyModel from '../../models/company';
import UserModel from '../../models/user';

export const validateStudentRegistration = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { email } = req.body;
  const { organizationId } = req.params;

  if (!organizationId) {
    throw new AppException(HttpStatusCode.BadRequest, 'Organization ID is required');
  }

  // Check if organization exists
  const organization = await CompanyModel.findById(organizationId);
  if (!organization) {
    throw new AppException(HttpStatusCode.NotFound, 'Organization not found');
  }

  // Check if user already exists
  const existingUser = await UserModel.findOne({ email });
  if (existingUser) {
    res.status(302).json({
      message: 'User already exists, please login',
    });
    return;
  }

  next();
};
