import { HttpStatusCode } from 'axios';

import AppException from '../../exceptions/appException';
import { jwtUtils } from '../../lib/jwtUtils';
import UserModel from '../../models/user';

export const authService = {
  verifyToken: async (token: string) => {
    const payload = jwtUtils.verifyAccessToken(token);
    const user = await UserModel.find({ email: payload?.email });
    if (!user) {
      throw new AppException(HttpStatusCode.Forbidden, 'Invalid or  expired token', {
        field: 'token',
        payload: `User not found with email: ${payload?.email} of token`,
      });
    }
    return user;
  },

  verifyDomainGetSlug: async (hostname: string) => {
    const domainParts = hostname.split('.');
    const domain = domainParts.slice(-2).join('.');
    const allowedMainDomains = ['lumaai.com', 'lumaai.localhost'];

    if (domainParts.length !== 3) {
      throw new AppException(HttpStatusCode.NotFound, 'Page not found', {
        payload: `Invalid domain structure: ${hostname}. Expected format is slug.lumaai.com`,
      });
    }

    if (!allowedMainDomains.includes(domain)) {
      throw new AppException(HttpStatusCode.NotFound, 'Page not found', {
        payload: `Invalid domain: ${hostname}, not include lumaai.com`,
      });
    }

    const slug = domainParts[0];
    if (!slug) {
      throw new AppException(HttpStatusCode.NotFound, 'Page not found', {
        payload: `Missing subdomain slug: ${hostname}`,
      });
    }

    return slug;
  },
};
