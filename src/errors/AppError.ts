export class AppError extends Error {
  public status: number;
  public isOperational: boolean;
  public details?: any;

  constructor(message: string, status = 500, details?: any) {
    super(message);
    this.status = status;
    this.isOperational = true;
    this.details = details;

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }

    // Set the name of the error to the class name
    this.name = this.constructor.name;
  }
}