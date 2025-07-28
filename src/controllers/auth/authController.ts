import AppException from '@src/exceptions/appException';
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
