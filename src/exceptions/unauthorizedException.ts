import AppException from './appException';

class UnauthorizedException extends AppException {
    constructor(message: string, payload?: Record<string, any>) {
        super(401, message, payload);
    }
}

export default UnauthorizedException;
