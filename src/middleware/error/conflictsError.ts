import { Request, Response, NextFunction } from 'express';
import logger from '../../utils/logger';
import ConflictsException from '../../exceptions/conflictsException';

export const conflictsError = (
    error: Error,
    req: Request,
    res: Response,
    next: NextFunction,
): void => {
    // Check error type
    if (error instanceof ConflictsException) {
        // record
        logger.info('Resource conflict', {
            payload: {
                method: req.method,
                path: req.path,
                message: error.message,
                ...error.payload,
            },
        });
        // response
        res.status(error.statusCode).json({
            success: false,
            error: error.message,
            ...error.payload,
        });

        return;
    }

    next(error);
};
