import type { SafePayload } from '../config';

class AppException extends Error {
  statusCode: number;
  payload: SafePayload;

  constructor(statusCode = 500, message: string, payload?: SafePayload) {
    super(message);
    this.name = new.target.name;
    this.statusCode = statusCode;
    this.payload = payload || {};
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export default AppException;
