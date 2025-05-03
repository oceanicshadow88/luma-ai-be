import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { errorHandler } from '../app/middleware/errorHandler';
import apiRoutes from '../app/handlers';

// Load environment variables
dotenv.config();

// Create Express app
const app: Express = express();

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', apiRoutes);

// Error Handling
app.use(errorHandler);

export default app;
