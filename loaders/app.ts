import express, { Express } from 'express';
import helmet from 'helmet';
import morgan from '../src/middleware/morgan';
import rateLimiter from '../src/middleware/rateLimit';
import v1Router from '../src/handlers/v1/api';
import errorHandler from '../src/middleware/error/errorHandler';
import { dynamicCorsMiddleware } from '../src/middleware/dynamicCorsMiddleware';

// Create Express app
const app: Express = express();

// Middleware
app.use(helmet());
app.use(dynamicCorsMiddleware);
app.use(morgan);
app.use(rateLimiter);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/v1', v1Router);

// Error Handling
app.use(errorHandler);

export default app;
