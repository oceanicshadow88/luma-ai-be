import AppException from '@src/exceptions/appException';
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

export const verifySubdomain = async (req: Request, res: Response) => {
  const company = req.company;
  const companyId = req.companyId;

  if (!company || !companyId) {
    throw new AppException(HttpStatusCode.NotFound, 'Page not found', {
      payload: `Company not found: ${req.company}`,
    });
  }
  return res.sendStatus(HttpStatusCode.Ok);
};
