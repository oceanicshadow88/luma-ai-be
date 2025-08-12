import AppException from '@src/exceptions/appException';
import { jwtUtils } from '@src/lib/jwtUtils';
import UserModel from '@src/models/user';
import { roleList, RoleType } from '@src/types/constants';
import logger from '@src/utils/logger';
import { HttpStatusCode } from 'axios';
import { NextFunction, Request, Response } from 'express';

function isValidRole(value: string): value is RoleType {
  return roleList.includes(value as RoleType);
}

export const validateTokenAndUrlWithInvitedUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const { token } = req.body;
  if (!token) {
    next();
    return;
  }

  const payload = jwtUtils.verifyAccessToken(token);
  if (!payload) {
    throw new AppException(HttpStatusCode.Unauthorized, 'Unauthorized Access', {
      payload: 'Cannot find token payload',
    });
  }

  const user = await UserModel.findById(payload.id);
  if (!user) {
    throw new AppException(
      HttpStatusCode.Unauthorized,
      `Invite User with ID ${payload.id} not found`,
    );
  }

  const reqCompanyId = req.companyId?.toString();
  const tokenCompanyId = payload.companyId?.toString();
  const userCompanyId = user.company?.toString();

  if (reqCompanyId !== tokenCompanyId || tokenCompanyId !== userCompanyId) {
    throw new AppException(
      HttpStatusCode.InternalServerError,
      `Company ID mismatch: ${req.companyId} !== ${payload.companyId} !== ${user.company}`,
    );
  }

  const url = req.originalUrl;
  const roleFromUrl = url.split('/').filter(Boolean).pop() ?? '';

  if (!roleFromUrl || !isValidRole(roleFromUrl)) {
    logger.info(`Invalid role in URL: ${roleFromUrl}`);
    next();
    return;
  }

  if (roleFromUrl !== payload.role || payload.role !== user.role) {
    throw new AppException(
      HttpStatusCode.InternalServerError,
      `Role mismatch: user = ${user.role}, URL path = ${roleFromUrl}, payload = ${payload.role}`,
    );
  }

  next();
};
