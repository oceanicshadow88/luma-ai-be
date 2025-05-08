import { SafePayload } from '../config';
import AppException from './appException';

class ForbiddenException extends AppException {
  constructor(message: string, payload?: SafePayload) {
    super(403, message, payload);
  }
}

export default ForbiddenException;
