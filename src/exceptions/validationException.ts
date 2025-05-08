import AppException from './appException';

class ValidationException extends AppException {
    constructor(message: string, payload?: Record<string, any>) {
        super(400, message, payload);
    }
}

export default ValidationException;
