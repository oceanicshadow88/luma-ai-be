import AppException from '@src/exceptions/appException';
import { jwtUtils } from '@src/lib/jwtUtils';
import UserModel from '@src/models/user';
import { companyService } from '@src/services/companyService';
import { VerifyInvitationLinkExist } from '@src/utils/invitationLink';
import { HttpStatusCode } from 'axios';
import { Request, Response } from 'express';

import { authService } from '../../services/auth/authService';

export const verifyAuthToken = async (req: Request, res: Response) => {
  const { token } = req.body;
  await authService.verifyToken(token);

  await VerifyInvitationLinkExist(token);

  return res.sendStatus(HttpStatusCode.Ok);
};

export const verifyDomain = async (req: Request, res: Response) => {
  const origin = req.headers.origin ?? `${req.protocol}://${req.hostname}`;
  const hostname = new URL(origin).hostname.toLowerCase();

  const comapnySlug = await authService.verifyDomainGetSlug(hostname);
  const existCompany = await companyService.getCompanyBySlug(comapnySlug);
  if (!existCompany) {
    throw new AppException(HttpStatusCode.NotFound, 'Page not found', {
      payload: `Company not found for slug: ${comapnySlug} of domain`,
    });
  }

  return res.sendStatus(HttpStatusCode.Ok);
};

export const isActiveUser = async (req: Request, res: Response) => {
  const authHeader = req.header('Authorization') ?? '';
  const token = authHeader.substring(7);
  // Verify token signature and expiration
  const payload = jwtUtils.verifyAccessToken(token);
  if (!payload) {
    throw new AppException(HttpStatusCode.Unauthorized, 'Unauthorized Access', {
      payload: 'Cannot find token payload',
    });
  }
  const user = await UserModel.findOne({ email: payload.email }); //payload should contain the ID
  return res.send({
    isActive: user?.active ?? false,
  });
};
