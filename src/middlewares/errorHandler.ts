import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError';

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

  // Handle AppError specifically
  if (err instanceof AppError) {
    errorResponse = {
      success: false,
      message: err.message,
      details: err.details,
    };

    // Don't send stack trace in production
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

  // Default to 500 status for unhandled errors
  res.status(500).json(errorResponse);
};

// Not Found Middleware
export const notFound = (req: Request, res: Response, next: NextFunction): void => {
  const error = new AppError(`Route ${req.originalUrl} not found`, 404);
  next(error);
};