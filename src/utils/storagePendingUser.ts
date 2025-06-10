import { RegisterUserInput } from '../controllers/auth/registerController';

let pendingUserData: RegisterUserInput | null = null;

export const setPendingUserData = (userData: RegisterUserInput) => {
  pendingUserData = userData;
};

export const getPendingUserData = () => pendingUserData;
export const getSafePendingUserData = (): Omit<
  RegisterUserInput,
  'password' | 'verifyCode'
> | null => {
  if (!pendingUserData) return null;

  const { firstName, lastName, username, email } = pendingUserData;
  return { firstName, lastName, username, email };
};

export const clearPendingUserData = () => {
  pendingUserData = null;
};
