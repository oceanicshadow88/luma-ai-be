import { Request, Response } from 'express';
import { LoginResult, loginService } from '../../services/auth/loginService';
import { extractSubdomain } from '../../lib/extractSubdomain';

export const login = async (req: Request, res: Response) => {
  // get data from request body
  const { email, password }: { email: string; password: string } = req.body;
  // call user service to do DB operation
  // const { refreshToken, accessToken, membership } = await loginService.login({
  //   email,
  //   password,
  // });
  const slug = await extractSubdomain(req);
  const loginResult: LoginResult = await loginService.userlogin({
    email,
    password,
    slug,
  });

  res.json({
    success: true,
    data: loginResult,
  });
};
