import { Request, Response } from 'express';
import { companyService } from '../services/companyService';

// 添加这个接口来扩展 Request 类型
// interface RequestWithUser extends Request {
//   user: {
//     _id: string;
//     [key: string]: string | number | boolean;
//   };
// }

// export const companyController = {
//   // Create a new company
//   createCompany: async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       const { name, slug, plan } = req.body;
//       const { timezone, locale, logoUrl, primaryColor } = req.body.settings || {};
//       const ownerId = req.user._id;

//       // 验证用户是否存在
//       const user = await User.findById(ownerId);
//       if (!user) {
//         return next(new AppError('User not found', 404));
//       }

//       // Check if company name or slug already exists
//       const existing = await Company.findOne({ $or: [{ name }, { slug }] });
//       if (existing) {
//         return next(new AppError('Company name or slug already exists', 400));
//       }

//       // Create company with default values
//       const company = await Company.create({
//         name,
//         slug,
//         plan,
//         ownerId,
//         settings: {
//           timezone,
//           locale,
//           logoUrl,
//           primaryColor,
//         },
//       });

//       res.status(201).json({
//         success: true,
//         data: company,
//       });
//     } catch (error) {
//       next(error);
//     }
//   },
// };

// interface IUser {
//   _id: object;
//   name: string;
//   email: string;
//   role: string;
// }

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
      const { name, plan, settings } = req.body;
      if (!req.user?._id) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const company = await companyService.createCompany({
        name,
        plan,
        ownerId: req.user._id,
        settings,
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
    } catch (error) {
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
    } catch (error) {
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
      const { name, plan, settings } = req.body;
      const company = await companyService.updateCompany(id, {
        name,
        plan,
        settings,
      });
      if (!company) {
        return res.status(404).json({ message: 'Company not found' });
      }
      res.json(company);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Internal server error' });
      }
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
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  },
};
