// authentication, authorization
import { Request, Response, NextFunction } from 'express';
import UserModel from '../models/user';
import { jwtUtils } from '../lib/jwtUtils';

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

    await user.hashPassword();

    // Generate tokens
    const accessToken = jwtUtils.generateAccessToken({ userId: user._id });
    const refreshToken = jwtUtils.generateRefreshToken({ userId: user._id });

    // Save refresh token to the database
    user.refreshToken = refreshToken;
    await user.save();

    res.status(201).json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatarUrl: user.avatarUrl,
        locale: user.locale,
      },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    return next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password }: { email: string; password: string } = req.body;

    const existingUser = await UserModel.findOne({ email }).exec();
    if (!existingUser) {
      res.status(401).json({ error: 'No account found with this email address' });
      return;
    }

    // Check password using the password utility
    const isPasswordValid: boolean = await existingUser.validatePassword(password);
    if (!isPasswordValid) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    // Generate tokens
    const accessToken = jwtUtils.generateAccessToken({ userId: existingUser._id });
    const refreshToken = jwtUtils.generateRefreshToken({ userId: existingUser._id });

    // Save refresh token to the database
    existingUser.refreshToken = refreshToken;
    await existingUser.save();

    res.json({
      user: {
        id: existingUser._id,
        username: existingUser.username,
        email: existingUser.email,
        avatarUrl: existingUser.avatarUrl,
        locale: existingUser.locale,
      },
      accessToken,
      refreshToken,
    });
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
      return res.status(400).json({ error: 'Refresh token is required' });
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
    return next(error);
  }
};
