import AppException from './appException';

class ConflictsException extends AppException {
  constructor(message: string, payload?: Record<string, any>) {
    super(409, message, payload);
  }
}

export default ConflictsException;
