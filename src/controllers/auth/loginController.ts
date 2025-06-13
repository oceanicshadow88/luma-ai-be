import { ROLE, RoleType } from '@src/config';
import { extractSubdomain } from '@src/lib/extractSubdomain';
import { LoginResult, loginService } from '@src/services/auth/loginService';
import { Request, Response } from 'express';

async function handleLogin(req: Request, res: Response, allowedRoles: RoleType[]) {
  const { email, password } = req.body;
  const slug = await extractSubdomain(req);

  const loginResult: LoginResult = await loginService.login({
    email,
    password,
    slug,
    allowedRoles,
  });

  res.json({ success: true, data: loginResult });
}

export const loginEnterprise = (req: Request, res: Response) =>
  handleLogin(req, res, [ROLE.ADMIN, ROLE.INSTRUCTOR]);

export const loginLearner = (req: Request, res: Response) => handleLogin(req, res, [ROLE.LEARNER]);
