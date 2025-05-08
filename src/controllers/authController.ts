// authentication, authorization
import { Request, Response, NextFunction } from 'express';
import UserModel from '../models/user';
import { generateToken } from '../utils/jwt';
import ConflictsException from '../exceptions/conflictsException';
import UnauthorizedException from '../exceptions/unauthorizedException';
import Joi from 'joi';

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Validate Data - Joi validate schema: deal in route with authvalidation middleware
    // Get params from request body
    const {
      username,
      password,
      email,
      avatarUrl,
      locale,
    }: {
      username: string;
      password: string;
      email: string;
      avatarUrl?: string;
      locale?: string;
    } = req.body
    // Check conflicts
    if (await UserModel.findOne({ email: email })) {
      next(new ConflictsException(`Email address: <${email}> already exists`));
      return;
    }

    // Create new user
    const user = new UserModel({
      username,
      password,
      email,
      avatarUrl,
      locale,
    });

    // password hash
    await user.hashPassword();
    await user.save();

    // token
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
    // no user
    if (!user) {
      next(new UnauthorizedException("User not found"));
      return;
    }

    // password wrong
    const validPassword = await user.validatePassword(password);
    if (!validPassword) {
      next(new UnauthorizedException('Invalid credentials'))
      return;
    }

    // token
    const token = generateToken({ id: user.id, username: user.username });

    res.json({ success: true, data: { token } });
  } catch (error) {
    next(error);
  }
};
