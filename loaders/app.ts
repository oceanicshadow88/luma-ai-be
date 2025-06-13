import v1Router from '@src/handlers/v1/api';
import errorHandler from '@src/middleware/error/errorHandler';
import morgan from '@src/middleware/morgan';
import rateLimiter from '@src/middleware/rateLimit';
import cors from 'cors';
import express, { Express } from 'express';
import helmet from 'helmet';

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
app.use('/api/v1', v1Router);

// Error Handling
app.use(errorHandler);

export default app;
