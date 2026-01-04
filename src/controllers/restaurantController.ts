import { Request, Response, NextFunction } from 'express';
import { RestaurantService } from '../services/restaurantService';
import { AppError } from '../errors/AppError';
import { AuthenticatedRequest } from '../middlewares/auth';

const restaurantService = new RestaurantService();

export const createRestaurant = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new AppError('User not authenticated', 401);
    }

    const { name, description, address, city, state, zipCode, phone, image } = req.body;

    const restaurant = await restaurantService.createRestaurant({
      name,
      description,
      address,
      city,
      state,
      zipCode,
      phone,
      image,
      ownerId: req.user.id
    });

    res.status(201).json({
      success: true,
      message: 'Restaurant created successfully',
      data: { restaurant }
    });
  } catch (error) {
    next(error);
  }
};

export const getRestaurantById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const restaurant = await restaurantService.getRestaurantById(id);

    res.status(200).json({
      success: true,
      message: 'Restaurant retrieved successfully',
      data: { restaurant }
    });
  } catch (error) {
    next(error);
  }
};

export const getRestaurantBySlug = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { slug } = req.params;
    const restaurant = await restaurantService.getRestaurantBySlug(slug);

    res.status(200).json({
      success: true,
      message: 'Restaurant retrieved successfully',
      data: { restaurant }
    });
  } catch (error) {
    next(error);
  }
};

export const getAllRestaurants = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const restaurants = await restaurantService.getAllRestaurants();

    res.status(200).json({
      success: true,
      message: 'Restaurants retrieved successfully',
      data: { restaurants }
    });
  } catch (error) {
    next(error);
  }
};

export const updateRestaurant = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new AppError('User not authenticated', 401);
    }

    const { id } = req.params;
    const { name, description, address, city, state, zipCode, phone, image, isActive } = req.body;

    const restaurant = await restaurantService.updateRestaurant(id, {
      name,
      description,
      address,
      city,
      state,
      zipCode,
      phone,
      image,
      isActive
    }, req.user.id);

    res.status(200).json({
      success: true,
      message: 'Restaurant updated successfully',
      data: { restaurant }
    });
  } catch (error) {
    next(error);
  }
};

export const deleteRestaurant = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new AppError('User not authenticated', 401);
    }

    const { id } = req.params;
    await restaurantService.deleteRestaurant(id, req.user.id);

    res.status(200).json({
      success: true,
      message: 'Restaurant deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};