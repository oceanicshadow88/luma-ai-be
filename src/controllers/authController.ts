// authentication, authorization
import { Request, Response, NextFunction } from 'express';
import UserModel from '../models/user';
import UnauthorizedException from '../exceptions/unauthorizedException';
import ConflictsException from '../exceptions/conflictsException';
import ValidationException from '../exceptions/validationException';
import { jwtUtils } from '../lib/jwtUtils';

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
    } = req.body;

    // Check conflicts
    const existUser = await UserModel.findOne({ email: email });
    if (existUser) {
      next(new ConflictsException(`${email} already exists`));
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

    // Generate tokens
    const accessToken = jwtUtils.generateAccessToken({ userId: user._id });
    const refreshToken = jwtUtils.generateRefreshToken({ userId: user._id });

    // Save refresh token to the database
    user.refreshToken = refreshToken;
    await user.save();
    // token
    const token = generateToken({ id: user.id, username: user.username });

    res.status(201).json({ success: true, data: { accessToken } });

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
      next(new UnauthorizedException('User not found'));
      return;
    }

    // password wrong
    const validPassword = await user.validatePassword(password);
    if (!validPassword) {
      next(new UnauthorizedException('Invalid credentials'));
      return;
    }
    // Generate tokens
    const accessToken = jwtUtils.generateAccessToken({ userId: existingUser._id });
    const refreshToken = jwtUtils.generateRefreshToken({ userId: existingUser._id });

    // Save refresh token to the database
    user.refreshToken = refreshToken;
    await existingUser.save();

    res.json({ success: true, data: {  accessToken } });
  } catch (error) {
    return next(error);
  }
};

export const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ error: 'Refresh token is required' });
    }

    // Verify refresh token
    const payload = jwtUtils.verifyRefreshToken(refreshToken);

    // Find user with the provided refresh token
    const user = await UserModel.findOne({ _id: payload.userId, refreshToken }).exec();

    if (!user) {
      return res.status(403).json({ error: 'Invalid refresh token' });
    }

    // Generate new tokens
    const newAccessToken = jwtUtils.generateAccessToken({ userId: user._id });
    const newRefreshToken = jwtUtils.generateRefreshToken({ userId: user._id });

    // Update refresh token in the database
    user.refreshToken = newRefreshToken;
    await user.save();

    res.json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    if (error instanceof Error && error.name === 'JsonWebTokenError') {
      return res.status(403).json({ error: 'Invalid refresh token' });
    }

    if (error instanceof Error && error.name === 'TokenExpiredError') {
      return res.status(403).json({ error: 'Refresh token expired' });
    }

    return next(error);
  }
};

export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      next(new ValidationException('Refresh token is required'));
      return ;
    }

    // Find user with the provided refresh token
    const user = await UserModel.findOne({ refreshToken }).exec();

    if (user) {
      // Clear refresh token
      user.refreshToken = undefined;
      await user.save();
    }

    res.status(204).send();

  } catch (error) {
    next(error);
  }
};
