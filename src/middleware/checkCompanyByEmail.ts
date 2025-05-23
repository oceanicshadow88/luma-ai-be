import { Request, Response, NextFunction } from 'express';
import { extractCompanySlug } from '../utils/extractCompanySlugFromEmail';
import AppException from 'src/exceptions/appException';
import { HttpStatusCode } from 'axios';
import CompanyModel from '../models/company';
import { ROUTES } from 'src/config';

export const checkCompanyExistByEmail = async (req: Request, res: Response, next: NextFunction) => {
    const { email } = req.body;
    const companySlug = await extractCompanySlug(email);
    if (!companySlug) {
        throw new AppException(HttpStatusCode.BadRequest, 'Please provide work email');
    };
    const existCompany = await CompanyModel.findOne({ slug: companySlug });
    if (!existCompany) {
        return res.status(302).json({
            message: 'The company does not exist',
            redirect: ROUTES.REGISTER_COMPANY
        });
    };

    next();
};
