import { Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError';
import { AuthenticatedRequest } from './auth';
import { UserRole } from '../types/enums';

export const requireRole = (...roles: UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    // Verify user is authenticated
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }

    // Check if user has required role
    if (!roles.includes(req.user.role)) {
      throw new AppError('Insufficient permissions', 403);
    }

    next();
  };
};



// Specific role middleware for convenience
export const requireAdmin = requireRole(UserRole.ADMIN);
export const requireRestaurantOwner = requireRole(UserRole.RESTAURANT_OWNER);
export const requireCustomer = requireRole(UserRole.CUSTOMER);

// Middleware to check if user is owner of a restaurant
export const requireRestaurantOwnership = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    throw new AppError('Authentication required', 401);
  }

  // Get restaurant ID from params (could be restaurantId or id depending on route)
  const restaurantId = req.params.restaurantId || req.params.id;
  
  if (req.user.role === UserRole.ADMIN) {
    // Admins can access all restaurants
    return next();
  }

  // Restaurant owners can only access their own restaurants
  if (req.user.role === UserRole.RESTAURANT_OWNER) {
    // Ownership validation is handled in the controller for better separation of concerns
    return next();
  }

  throw new AppError('Insufficient permissions', 403);
};

