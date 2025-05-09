import { SafePayload } from '../config';
import AppException from './appException';

class NotFoundException extends AppException {
  constructor(message: string, payload?: SafePayload) {
    super(404, message, payload);
  }
}

export default NotFoundException;
