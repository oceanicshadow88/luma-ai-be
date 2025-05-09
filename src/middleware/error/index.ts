import { ErrorRequestHandler } from 'express';
import validationError from './badRequestError';
import finalError from './finalError';
import unauthorizedError from './unauthorizedError';
import notFoundError from './notFoundError';
import conflictsError from './conflictsError';
import forbiddenError from './forbiddenError';

const errorMiddleware: ErrorRequestHandler[] = [
  //409 -
  conflictsError,
  //400
  validationError,
  //401
  unauthorizedError,
  //403
  forbiddenError,
  //404
  notFoundError,

  //500
  finalError,
];

export default errorMiddleware;
