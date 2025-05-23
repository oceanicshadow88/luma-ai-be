import { RegistUserInput } from "../controllers/auth/registerController";

let tempUserData: RegistUserInput | null = null;

export const setTempUserData = (userData: RegistUserInput) => {
    tempUserData = userData;
};

export const getTempUserData = () => tempUserData;

export const clearTempUserData = () => {
    tempUserData = null;
};
