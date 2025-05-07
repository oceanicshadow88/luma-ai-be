class AppException extends Error {
    statusCode: number;
    payload: Record<string, any>;
    
    constructor(statusCode = 500, message:string, payload:Record<string, any>) {
      super(message);
      this.name = this.constructor.name;
      this.statusCode = statusCode;
      this.payload = payload;
    }
  } 