import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { AppError } from '../errors/AppError';
import { User } from '../models/User';
import { AppDataSource } from '../database/datasource';

export interface AuthenticatedRequest extends Request {
  user?: User;
}

export const authenticate = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Get the token from header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Authentication required', 401);
    }

    const token = authHeader.split(' ')[1];

    // Check if token is valid
    const tokenPayload = verifyToken(token);

    if (!tokenPayload) {
      throw new AppError('Invalid or expired token', 401);
    }

    // Fetch user data but exclude password
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({
      where: { id: tokenPayload.userId },
      select: ['id', 'email', 'role', 'firstName', 'lastName', 'isActive']
    });

    if (!user || !user.isActive) {
      throw new AppError('User not found or inactive', 401);
    }

    // Add user to request for later use
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

