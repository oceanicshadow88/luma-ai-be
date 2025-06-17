import { RegisterUserInput } from '../controllers/auth/registerController';

let pendingUserData: RegisterUserInput | null = null;

export const setPendingUserData = (userData: RegisterUserInput) => {
  pendingUserData = userData;
};

export const getPendingUserData = () => pendingUserData;
export const getSafePendingUserData = (): {
  firstname: string;
  lastname: string;
  username: string;
  email: string;
} | null => {
  if (!pendingUserData) return null;

  const { firstname, lastname, username, email } = pendingUserData;
  return { firstname, lastname, username, email };
};

export const clearPendingUserData = () => {
  pendingUserData = null;
};
