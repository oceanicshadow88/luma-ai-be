import AppException from '@src/exceptions/appException';
import { jwtUtils } from '@src/lib/jwtUtils';
import { HttpStatusCode } from 'axios';
import { NextFunction, Request, Response } from 'express';

export const someAuth = (req: Request, res: Response, next: NextFunction): void => {
  const { token } = req.body;
  if (!token) {
    next();
  }
  const payload = jwtUtils.verifyAccessToken(token);
  if (!payload) {
    throw new AppException(HttpStatusCode.Unauthorized, 'Unauthorized Access', {
      payload: 'Cannot find token payload',
    });
  }

  if (req.companyId.toString() !== payload.companyId.toString()) {
    throw new AppException(
      HttpStatusCode.InternalServerError,
      `Company ID mismatch: ${req.companyId} !== ${payload.companyId}`,
    );
  }

  next();
};
