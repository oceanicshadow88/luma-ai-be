// authentication, authorization
import { Request, Response, NextFunction } from 'express';
import UserModel from '../models/user';
import { generateToken } from '../utils/jwt';

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

    if(await UserModel.findOne({email: email})){
      res.status(409).json({success:false, error:'Email already exists'});
    };

    await user.hashPassword();
    await user.save();

    const token = generateToken({ id: user.id, username: user.username });

    res.status(201).json({ success: true, data: { token } });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    const user = await UserModel.findOne({ email: email });
    if (!user) {
      res.status(401).json({ success: false, error: 'No account found with this email address' });
      return;
    }
    const validPassword = await user.validatePassword(password);
    if (!validPassword) {
      res.status(401).json({ success: false, error: 'Invalid credentials' });
      return;
    }

    const token = generateToken({ id: user.id, username: user.username });

    res.json({ success: true, data: { token } });
  } catch (error) {
    next(error);
  }
};
