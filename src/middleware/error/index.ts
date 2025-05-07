import { ErrorRequestHandler } from 'express';
import { validationError } from './validationError';
import { finalError } from './finalError';
import { conflictsError } from './conflictsError';
import { unauthorizedError } from './unauthorizedError';

const errorMiddleware: ErrorRequestHandler[] = [
  //400
  validationError,
  //401
  unauthorizedError,
  //409
  conflictsError,
  //500
  finalError,
];

export default errorMiddleware;
