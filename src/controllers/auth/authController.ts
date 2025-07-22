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
