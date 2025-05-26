import { RegistUserInput } from '../controllers/auth/registerController';

let pendingUserData: RegistUserInput | null = null;

export const setPendingUserData = (userData: RegistUserInput) => {
  pendingUserData = userData;
};

export const getPendingUserData = () => pendingUserData;
export const getSafePendingUserData = (): Omit<
  RegistUserInput,
  'password' | 'verifyCode'
> | null => {
  if (!pendingUserData) return null;

  const { firstname, lastname, username, email } = pendingUserData;
  return { firstname, lastname, username, email };
};

export const clearPendingUserData = () => {
  pendingUserData = null;
};
