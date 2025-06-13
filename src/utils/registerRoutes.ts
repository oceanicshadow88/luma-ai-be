import { asyncHandler } from '@src/middleware/asyncHandler';
import { Request, RequestHandler, Response, Router } from 'express';

type AsyncHandlerFn = (req: Request, res: Response) => Promise<void | Response>;

type RouteDefinition = {
  method: 'get' | 'post' | 'put' | 'delete' | 'patch';
  path: string;
  middlewares?: RequestHandler[];
  handler: AsyncHandlerFn;
};

export function registerRoutes(router: Router, routes: RouteDefinition[]) {
  routes.forEach(({ method, path, middlewares = [], handler }) => {
    router[method](path, ...middlewares, asyncHandler(handler));
  });
}
