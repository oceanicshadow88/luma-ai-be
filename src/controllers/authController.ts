// authentication, authorization
import { Request, Response, NextFunction } from 'express';
import UserModel from '../models/uuser';

export const register = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {
            username,
            password,
            email,
            avatarUrl,
            locale,
        }: { username: string; password: string; email: string; avatarUrl?: string; locale: string } =
            req.body;
        const user = new UserModel({
            username,
            password,
            email,
            avatarUrl,
            locale,
        });
        await user.save();

        res.status(201).json(user);
    } catch (error) {
        return next(error);
    }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password }: { email: string; password: string } = req.body;

        const existingUser = await UserModel.findOne({ email }).exec();
        if (!existingUser) {
            res.status(401).json({ error: 'Email not exist' });
            return;
        }

        // Check password
        if (existingUser.password !== password) {
            // fail fast
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }

        res.json({ email: existingUser.email });
    } catch (error) {
        return next(error);
    }
};
