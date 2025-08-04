import AppException from '@src/exceptions/appException';
import { jwtUtils } from '@src/lib/jwtUtils';
import UserModel from '@src/models/user';
import { HttpStatusCode } from 'axios';
import { NextFunction, Request, Response } from 'express';

export const someAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { token } = req.body;
  const url = req.originalUrl;
  const roleFromUrl = url.split('/').filter(Boolean).pop();

  if (!token) {
    next();
  }
  const payload = jwtUtils.verifyAccessToken(token);
  if (!payload?.id || !payload?.companyId || !payload?.role) {
    throw new AppException(HttpStatusCode.Unauthorized, 'Unauthorized Access', {
      payload: 'Cannot find token payload',
    });
  }

  const user = await UserModel.findById(payload.id);
  if (!user) {
    throw new AppException(
      HttpStatusCode.Unauthorized,
      `Invite User with ID ${payload._id} not found`,
    );
  }

  if (
    req.companyId.toString() !== payload.companyId.toString() ||
    payload.companyId.toString() !== user.company.toString()
  ) {
    throw new AppException(
      HttpStatusCode.InternalServerError,
      `Company ID mismatch: ${req.companyId} !== ${payload.companyId} !== ${user.company}`,
    );
  }

  if (user.role !== roleFromUrl || payload.role !== roleFromUrl) {
    throw new AppException(
      HttpStatusCode.InternalServerError,
      `Role mismatch: user = ${user.role}, URL path = ${roleFromUrl}, payload = ${payload.role}`,
    );
  }

  next();
};
