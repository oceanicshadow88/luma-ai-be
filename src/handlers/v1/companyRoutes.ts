import { Router, RequestHandler } from 'express';
import { companyController } from '../../controllers/companyController';
import { auth } from '../../middleware/auth';
import { validateCompany } from '../../validations/companyValidaton';

const router = Router();

// Create company
router.post('/', 
  auth as RequestHandler,
  validateCompany.createCompany as unknown as RequestHandler[],
  companyController.createCompany as RequestHandler
);

// Get all companies for current user
router.get('/', 
  auth as RequestHandler,
  companyController.getCompanies as RequestHandler
);

// Get company by ID
router.get('/:id', 
  auth as RequestHandler,
  validateCompany.getCompany as unknown as RequestHandler[],
  companyController.getCompanyById as RequestHandler
);

// Update company
router.patch('/:id', 
  auth as RequestHandler,
  validateCompany.updateCompany as unknown as RequestHandler[],
  companyController.updateCompany as RequestHandler
);

// Delete company
router.delete('/:id', 
  auth as RequestHandler,
  validateCompany.getCompany as unknown as RequestHandler[],
  companyController.deleteCompany as RequestHandler
);

export default router;
