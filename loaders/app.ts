import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimiter from '../src/middleware/rateLimit';
import { errorHandler } from '../src/middleware/errorHandler';
import v1Router from '../src/handlers/v1'

// Create Express app
const app: Express = express();

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(rateLimiter);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/v1', v1Router);

// Error Handling
app.use(errorHandler);

export default app;
