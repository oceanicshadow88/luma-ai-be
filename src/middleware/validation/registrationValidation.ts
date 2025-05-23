// import { Request, Response, NextFunction } from 'express';
// import { userValidateRole } from './userRoleValidator';
// import { ROLE, ROUTES } from '../../config';

// export const validateRegistration = async (
//   req: Request,
//   res: Response,
//   next: NextFunction,
// ): Promise<void> => {
//   const { email } = req.body;

//   const result = await userValidateRole(email, ROLE.ADMIN);
//   if (result.success) {
//     res.status(302).json({ message: 'User already registered', redirect: ROUTES.LOGIN_USER });
//   } else {
//     switch (result.reason) {
//       case 'USER_NOT_FOUND': {
//         // if pass then joi validation
//         next();
//         break;
//       }

//       case 'COMPANY_NOT_FOUND': {
//         // have user no company
//         res
//           .status(302)
//           .json({ message: 'The company does not exist', redirect: ROUTES.REGISTER_COMPANY });
//         break;
//       }

//       default:
//         res.status(400).json({ message: 'Unknown registration state' });
//         break;
//     }
//   }
// };
