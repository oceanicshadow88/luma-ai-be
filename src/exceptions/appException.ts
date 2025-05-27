import type { SafePayload } from '../config';

class AppException extends Error {
  statusCode: number;
  payload?: SafePayload;

  constructor(statusCode: number, message: string, payload?: SafePayload) {
    super(message);
    this.statusCode = statusCode;
    this.payload = payload;

    // make sure instandof work in old environment
    Object.setPrototypeOf(this, AppException.prototype);
  }
}

export default AppException;
