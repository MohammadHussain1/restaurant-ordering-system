import { Request, Response, NextFunction } from 'express';
import { RestaurantService } from '../services/restaurantService';
import { AppError } from '../errors/AppError';
import { AuthenticatedRequest } from '../middlewares/auth';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const restaurantService = new RestaurantService();

// Set up multer for restaurant image uploads
const restaurantStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(process.cwd(), 'uploads', 'restaurants');
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const restaurantFileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Check allowed file types
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
    cb(null, true);
  } else {
    cb(new AppError('Invalid file type. Only JPG and PNG files are allowed.', 400));
  }
};

export const restaurantUpload = multer({ 
  storage: restaurantStorage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '2097152') // Default to 2MB
  },
  fileFilter: restaurantFileFilter
});

export const createRestaurant = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new AppError('User not authenticated', 401);
    }

    const { name, description, address, city, state, zipCode, phone } = req.body;

    // Handle image upload
    let imagePath: string | undefined;
    if (req.file) {
      imagePath = `/uploads/restaurants/${req.file.filename}`;
    }

    const restaurant = await restaurantService.createRestaurant({
      name,
      description,
      address,
      city,
      state,
      zipCode,
      phone,
      image: imagePath,
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
    const { name, description, address, city, state, zipCode, phone, isActive } = req.body;

    // Handle image upload
    let imagePath: string | undefined;
    if (req.file) {
      imagePath = `/uploads/restaurants/${req.file.filename}`;
    }

    const restaurant = await restaurantService.updateRestaurant(id, {
      name,
      description,
      address,
      city,
      state,
      zipCode,
      phone,
      image: imagePath,
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