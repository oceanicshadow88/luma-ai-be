import UnauthorizedException from "../../exceptions/unauthorizedException";
import UserModel from "../../models/user";
import { generateTokenByUser } from "../../utils/token";

export const loginService = {
    adminLogin: async ({ email, password }: { email: string; password: string }) => {
        // check user exist
        const user = await UserModel.findOne({ email });

        if (!user) {
            throw new UnauthorizedException('User not found. Redirect to register.', { payload: { redirectTo: '/v1/auth/register/admin' } });
        }
        // verify password
        const isValidPassword = await user.validatePassword(password);
        if (!isValidPassword) {
            throw new UnauthorizedException('Invalid credentials');
        }

        // generate token
        const { refreshToken, accessToken } = await generateTokenByUser(user);

        // save refreshToken
        user.refreshToken = refreshToken;
        await user.save();

        return { refreshToken, accessToken };
    },

}