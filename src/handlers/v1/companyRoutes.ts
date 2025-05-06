import { Router } from 'express';
import { companyController } from '../../controllers/companyController';
import { auth } from '../../middleware/auth';
import { companyValidators } from '../../validations/companyValidaton';

const router = Router();

// Create company
router.post('/', auth, companyValidators.createCompany, companyController.createCompany);

// Get all companies for current user
router.get('/', auth, companyController.getCompanies);

// Get company by ID
router.get('/:id', auth, companyValidators.getCompany, companyController.getCompanyById);

// Update company
router.patch('/:id', auth, companyValidators.updateCompany, companyController.updateCompany);

// Delete company
router.delete('/:id', auth, companyValidators.getCompany, companyController.deleteCompany);

export default router;
