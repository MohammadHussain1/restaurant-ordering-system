import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError';

// Response format for errors
interface ErrorResponse {
  success: boolean;
  message: string;
  details?: any;
  stack?: string;
}

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction): void => {
  let errorResponse: ErrorResponse = {
    success: false,
    message: err.message || 'Internal Server Error',
  };

  // Handle custom app errors
  if (err instanceof AppError) {
    errorResponse = {
      success: false,
      message: err.message,
      details: err.details,
    };

    // Only show stack trace during development
    if (process.env.NODE_ENV === 'development') {
      errorResponse.stack = err.stack;
    }

    res.status(err.status).json(errorResponse);
    return;
  }

  // Handle other errors
  if (process.env.NODE_ENV === 'development') {
    errorResponse.stack = err.stack;
  }

  // Send 500 for unexpected errors
  res.status(500).json(errorResponse);
};



// Handle 404s
export const notFound = (req: Request, res: Response, next: NextFunction): void => {
  const error = new AppError(`Route ${req.originalUrl} not found`, 404);
  next(error);
};

