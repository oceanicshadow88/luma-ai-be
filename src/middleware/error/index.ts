import { ErrorRequestHandler } from 'express';
import { validationError } from './validationError';
import { finalError } from './finalError';

const errorMiddleware: ErrorRequestHandler[] = [
    //400
    validationError,
    //500
    finalError,
];

export default errorMiddleware;