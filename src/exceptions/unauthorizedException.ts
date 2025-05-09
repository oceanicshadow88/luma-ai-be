import { SafePayload } from '../config';
import AppException from './appException';

class UnauthorizedException extends AppException {
  constructor(message: string, payload?: SafePayload) {
    super(401, message, payload);
  }
}

export default UnauthorizedException;
