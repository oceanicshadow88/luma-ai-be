import { Request, Response } from 'express';

import { ROLE, RoleType } from '../../config';
import { LoginResult, loginService } from '../../services/auth/loginService';

async function handleLogin(req: Request, res: Response, allowedRoles: RoleType[]) {
  const { email, password } = req.body;
  const slug = req.company.slug;

  const loginResult: LoginResult = await loginService.login({
    email,
    password,
    slug,
    allowedRoles,
    companyId: req.company._id.toString(),
  });

  res.json({ success: true, data: loginResult });
}

export const loginEnterprise = (req: Request, res: Response) =>
  handleLogin(req, res, [ROLE.ADMIN, ROLE.INSTRUCTOR]);

export const loginLearner = (req: Request, res: Response) => handleLogin(req, res, [ROLE.LEARNER]);
