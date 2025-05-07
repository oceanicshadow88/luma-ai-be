class AppException extends Error {
  statusCode: number;
  payload: Record<string, any>;

  constructor(statusCode = 500, message: string, payload?: Record<string, any>) {
    super(message);
    this.name = new.target.name;
    this.statusCode = statusCode;
    this.payload = payload || {};
  }
}

export default AppException;
