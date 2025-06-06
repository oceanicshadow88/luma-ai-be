import { Request, Response } from 'express';
import { LoginResult, loginService } from '../../services/auth/loginService';
import { extractSubdomain } from '../../lib/extractSubdomain';
import { ROLE, RoleType } from '../../config';

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

export const loginLearner = (req: Request, res: Response) => handleLogin(req, res, [ROLE.STUDENT]);
