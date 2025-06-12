import { Request, Response } from 'express';
import { LoginResult, loginService } from '../../services/auth/loginService';
import { extractCompanySlugbySubdomain } from '../../utils/extractCompanySlugbySubdomain';
import { ROLE, RoleType } from '../../config';

async function handleLogin(req: Request, res: Response, allowedRoles: RoleType[]) {
  const { email, password } = req.body;
  const slug = await extractCompanySlugbySubdomain(req);

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
