import { Request, Response } from 'express';

import { LoginResult, loginService } from '../../services/auth/loginService';

export async function handleLogin(req: Request, res: Response) {
  const { email, password } = req.body;
  const slug = req.company.slug;

  const loginResult: LoginResult = await loginService.login({
    email,
    password,
    slug,
    companyId: req.company._id.toString(),
  });

  res.json({ success: true, data: loginResult });
}
