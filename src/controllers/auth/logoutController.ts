import { Request, Response, NextFunction } from 'express';
import { logoutService } from '../../services/auth/logoutService';
export const userLogout = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { refreshToken } = req.body;
        await logoutService.logoutUser(refreshToken);
        res.status(204).send();

    } catch (error) {
        next(error);
    }
};