import { jwtUtils } from "../lib/jwtUtils";
import { Types } from "mongoose";
import UserModel, { User } from '../models/user';
import UnauthorizedException from "../exceptions/unauthorizedException";

export const generateTokenByUser = async (user: User) => {
    // generate Token
    const userId = (user._id as Types.ObjectId).toString();
    const accessToken = jwtUtils.generateAccessToken({ userId });
    const refreshToken = jwtUtils.generateRefreshToken({ userId });

    return { accessToken, refreshToken };
};

export const refreshAuthToken = async (refreshToken: string) => {
    const payload = jwtUtils.verifyRefreshToken(refreshToken);

    const user = await UserModel.findOne({ _id: payload.userId, refreshToken });
    if (!user) {
        throw new UnauthorizedException('Invalid refresh token');
    }

    const newAccessToken = jwtUtils.generateAccessToken({
        userId: (user._id as Types.ObjectId).toString(),
    });
    const newRefreshToken = jwtUtils.generateRefreshToken({
        userId: (user._id as Types.ObjectId).toString(),
    });

    user.refreshToken = newRefreshToken;
    await user.save();

    return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
    };
};

