import AppException from './appException';
import type { SafePayload } from '../config';

class ConflictsException extends AppException {
  constructor(message: string, payload?: SafePayload) {
    super(409, message, payload);
  }
}

export default ConflictsException;
