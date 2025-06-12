import express, { Express, NextFunction, RequestHandler, Router, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from '../src/middleware/morgan';
import rateLimiter from '../src/middleware/rateLimit';
import v1Router from '../src/handlers/v1/api';
import errorHandler from '../src/middleware/error/errorHandler';

export const catchAllErrors = (
  fn: (req: Request, res: Response, next: NextFunction) => any,
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

function wrapRoutes(router: Router): Router {
  const stack = (router as any).stack;
  for (const layer of stack) {
    if (layer.route && layer.route.stack) {
      for (const routeLayer of layer.route.stack) {
        const handler = routeLayer.handle;
        if (handler.constructor.name === 'AsyncFunction') {
          routeLayer.handle = catchAllErrors(handler);
        }
      }
    }
  }

  return router;
}
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

export default app;
