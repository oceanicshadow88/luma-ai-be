import AppException from '@src/exceptions/appException';
import { jwtUtils } from '@src/lib/jwtUtils';
import { HttpStatusCode } from 'axios';
import { NextFunction, Request, Response } from 'express';

export const someAuth = (req: Request, res: Response, next: NextFunction): void => {
  const { token } = req.body;
  if (!token) {
    console.log('aaa', token);
    next();
    return;
  }
  console.log('bbb');
  const payload = jwtUtils.verifyAccessToken(token);
  console.log('bbb', payload);
  if (!payload) {
    throw new AppException(HttpStatusCode.Unauthorized, 'Unauthorized Access', {
      payload: 'Cannot find token payload',
    });
  }
  console.log('ccc');
  if (req.companyId.toString() !== payload.companyId.toString()) {
    throw new AppException(
      HttpStatusCode.InternalServerError,
      `Company ID mismatch: ${req.companyId} !== ${payload.companyId}`,
    );
  }

  next();
};
