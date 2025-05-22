import { Request, Response, NextFunction } from 'express';

export const companyController = {
  // Create company
  createCompany: async (req: Request, res: Response, next: NextFunction) => {
    // Validate Data - Joi validate schema: deal in route
    // Get params from request body
  },
};
