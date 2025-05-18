import { Request, Response } from 'express';
import { companyService } from '../services/companyService';
import { getUserProps } from '../middleware/getUserProps';

declare module 'express-serve-static-core' {
  interface Request {
    user?: {
      _id: string;
      name: string;
      email: string;
      role: string;
    };
  }
}

export const companyController = {
  // Create company
  createCompany: async (req: Request, res: Response) => {
    try {
      const { name, plan, settings, _active } = req.body;
      if (!req.user?._id) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const company = await companyService.createCompany({
        name,
        plan,
        ownerId: req.user._id,
        settings,
        userEmail: req.user.email,
      });
      res.status(201).json(company);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  },

  // Get all companies for current user
  getCompanies: async (req: Request, res: Response) => {
    try {
      if (!req.user?._id) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      const companies = await companyService.getCompaniesByOwnerId(req.user._id);
      res.json(companies);
    } catch {
      res.status(500).json({ message: 'Internal server error' });
    }
  },

  // Get company by ID
  getCompanyById: async (req: Request, res: Response) => {
    try {
      const id = req.params.id;
      if (!id) {
        return res.status(400).json({ message: 'Company ID is required' });
      }
      const company = await companyService.getCompanyById(id);
      if (!company) {
        return res.status(404).json({ message: 'Company not found' });
      }
      res.json(company);
    } catch {
      res.status(500).json({ message: 'Internal server error' });
    }
  },

  // Update company
  updateCompany: async (req: Request, res: Response) => {
    try {
      const id = req.params.id;
      if (!id) {
        return res.status(400).json({ message: 'Company ID is required' });
      }
      const { name, plan, settings, active } = req.body;
      const company = await companyService.updateCompany(id, {
        name,
        plan,
        settings,
        active,
      });
      if (!company) {
        return res.status(404).json({ message: 'Company not found' });
      }
      res.json(company);
    } catch {
      res.status(500).json({ message: 'Internal server error' });
    }
  },

  // Delete company
  deleteCompany: async (req: Request, res: Response) => {
    try {
      const id = req.params.id;
      if (!id) {
        return res.status(400).json({ message: 'Company ID is required' });
      }
      const result = await companyService.deleteCompany(id);
      if (!result) {
        return res.status(404).json({ message: 'Company not found' });
      }
      res.status(204).send();
    } catch {
      res.status(500).json({ message: 'Internal server error' });
    }
  },

  checkEmailAndSendCode: async (req: Request, res: Response) => {
    try {
      const { email } = req.body;
      const result = await companyService.checkEmailAndSendCode(email);
      res.status(200).json({
        success: true,
        emailExists: false,
        nextStep: 'registration',
        data: {
          email,
          ...result,
        },
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error checking email',
      });
    }
  },

  verifyCode: async (req: Request, res: Response) => {
    try {
      const { email, code } = req.body;
      const result = await companyService.verifyCode(email, code);
      res.json(result);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  },

  resendCode: async (req: Request, res: Response) => {
    try {
      const { email } = req.body;
      await companyService.checkEmailAndSendCode(email);
      res.json({ success: true });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  },

  checkDomainAndCreate: async (req: Request, res: Response) => {
    try {
      const { email, organizationData } = req.body;
      const company = await companyService.checkDomainAndCreate(email, organizationData);
      res.json(company);
    } catch {
      res.status(500).json({ message: 'Internal server error' });
    }
  },

  completeRegistration: async (req: Request, res: Response) => {
    try {
      const result = await companyService.completeRegistration(req.body);
      res.json(result);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  },

  createInvite: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { email, role } = req.body;
      if (!id) {
        return res.status(400).json({ message: 'Company ID is required' });
      }
      const invite = await companyService.createInvite(id, email, role);
      res.status(201).json(invite);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  },

  createCompanyAndAccount: async (req: Request, res: Response) => {
    try {
      const { encryptedData, companyName } = req.body;
      const userDataResult = await getUserProps(encryptedData);
      if (!userDataResult.props.user) {
        return res.status(400).json({
          success: false,
          message: 'Invalid user data',
        });
      }
      const userData = userDataResult.props.user;
      const result = await companyService.createCompanyAndAccount({
        email: userData.email,
        companyName,
        password: userData.password,
        firstName: userData.firstname,
        lastName: userData.lastname,
      });

      res.status(201).json({
        success: true,
        data: {
          company: result.company,
          user: result.user,
          redirectTo: '/login',
        },
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to create company',
      });
    }
  },

  checkCompanySlug: async (req: Request, res: Response) => {
    try {
      const { companyName } = req.body;
      const exists = await companyService.checkCompanySlugExists(companyName);
      return res.json({
        success: true,
        hasCompanyName: exists,
        canCreate: !exists,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error checking company name',
      });
    }
  },
};
