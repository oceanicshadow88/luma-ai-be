import { Request, Response } from 'express';
import { loginService } from '../../services/auth/loginService';

export const login = async (req: Request, res: Response) => {
  // get data from request body
  const { email, password }: { email: string; password: string } = req.body;
  // call user service to do DB operation
  const { refreshToken, accessToken, membership } = await loginService.login({
    email,
    password,
  });

  res.json({
    success: true,
    data: { refreshToken, accessToken, membership },
  });
};
