import { Request, Response, NextFunction } from 'express';
import { loginService } from '../../services/auth/loginService';

export const adminLogin = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // get data from request body
        const { email, password }: { email: string; password: string } = req.body;
        // call user service to do DB operation
        const { refreshToken } = await loginService.adminLogin({ email, password });

        res.json({ success: true, data: { refreshToken } });

    } catch (error) {
        return next(error);
    }
};

