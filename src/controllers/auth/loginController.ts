import { Request, Response } from 'express';
import { loginService } from '../../services/auth/loginService';

export const adminLogin = async (req: Request, res: Response) => {
  // get data from request body
  const { email, password }: { email: string; password: string } = req.body;
  // call user service to do DB operation
  const { refreshToken, accessToken, username, role } = await loginService.adminLogin({
    email,
    password,
  });

  res.json({
    success: true,
    redirect: '',
    data: { refreshToken, accessToken, username, role },
  });
};
