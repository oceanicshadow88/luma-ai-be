import { SafePayload } from '../config';
import AppException from './appException';

class ValidationException extends AppException {
  constructor(message: string, payload?: SafePayload) {
    super(400, message, payload);
  }
}

export default ValidationException;
