import cors from 'cors';
import express, { Express, NextFunction, Request, RequestHandler, Response, Router } from 'express';
import helmet from 'helmet';

import { companySeeder } from '../src/database/seeder/companySeeder';
import { userSeeder } from '../src/database/seeder/userSeeder';
import v1Router from '../src/handlers/v1/api';
import errorHandler from '../src/middleware/error/errorHandler';
import morgan from '../src/middleware/morgan';
import rateLimiter from '../src/middleware/rateLimit';

export const catchAllErrors = (
  fn: (req: Request, res: Response, next: NextFunction) => void | Promise<void>,
): RequestHandler => {
  return (req, res, next) => {
    try {
      const result = fn(req, res, next);
      if (result && typeof result.then === 'function') {
        result.catch(next); // async error
      }
    } catch (err) {
      next(err); // sync error
    }
  };
};

interface ExpressLayer {
  route?: {
    stack: ExpressRouteLayer[];
  };
  // Add other properties you might need from the layer
}

interface ExpressRouteLayer {
  handle: RequestHandler;
  // Add other properties you might need from the route layer
}

function wrapRoutes(router: Router): Router {
  const stack = router.stack as unknown as ExpressLayer[];
  for (const layer of stack) {
    if (layer.route?.stack) {
      for (const routeLayer of layer.route.stack) {
        const handler = routeLayer.handle;
        if (handler.constructor.name === 'AsyncFunction') {
          routeLayer.handle = catchAllErrors(
            handler as (req: Request, res: Response, next: NextFunction) => void | Promise<void>,
          );
        }
      }
    }
  }

  return router;
}

async function initData() {
  if (process.env.NODE_ENV === 'local') {
    const user = await userSeeder.seedDefault();
    await companySeeder.seedDefault(user);
  }
}
function init() {
  // Create Express app
  const app: Express = express();

  // Middleware
  app.use(helmet());
  app.use(cors());
  app.use(morgan);
  app.use(rateLimiter);
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Routes
  app.use('/api/v1', wrapRoutes(v1Router));

  // Error Handling
  app.use(errorHandler);
  // eslint-disable-next-line @typescript-eslint/no-floating-promises
  initData();
  return app;
}

const app = init();
export default app;
