import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError';

export const validate = (schema: any) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.body, { abortEarly: false });

    if (error) {
      const errors = error.details.map((detail: any) => detail.message);
      throw new AppError(`Validation error: ${errors.join(', ')}`, 400, errors);
    }

    req.body = value;
    next();
  };
};