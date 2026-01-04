import { Request, Response, NextFunction } from 'express';
import { MenuService } from '../services/menuService';
import { AppError } from '../errors/AppError';
import { AuthenticatedRequest } from '../middlewares/auth';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { getRedisClient } from '../config/redis';

const menuService = new MenuService();



// Set up multer for menu item image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(process.cwd(), 'uploads', 'menu');
    
    // Create upload directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Generate unique filename to avoid conflicts
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Only allow JPEG and PNG images
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
    cb(null, true);
  } else {
    cb(new AppError('Invalid file type. Only JPG and PNG files are allowed.', 400));
  }
};

export const upload = multer({ 
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '2097152') // Default to 2MB
  },
  fileFilter
});

export const createMenuItem = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new AppError('User not authenticated', 401);
    }

    const { name, description, price, category, restaurantId } = req.body;
    
    // Check if an image was uploaded
    let menuImgPath: string | undefined;
    if (req.file) {
      menuImgPath = `/uploads/menu/${req.file.filename}`;
    }

    const newMenuItem = await menuService.createMenuItem({
      name,
      description,
      price: parseFloat(price),
      category,
      restaurantId,
      image: menuImgPath
    });

    res.status(201).json({
      success: true,
      message: 'Menu item created successfully',
      data: { menuItem: newMenuItem }
    });
  } catch (error) {
    next(error);
  }
};

export const getMenuItemById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const menuItemData = await menuService.getMenuItemById(id);

    res.status(200).json({
      success: true,
      message: 'Menu item retrieved successfully',
      data: { menuItem: menuItemData }
    });
  } catch (error) {
    next(error);
  }
};

export const getMenuByRestaurantId = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { restaurantId } = req.params;
    
    // First check if we have the menu cached in Redis
    const redisClient = getRedisClient();
    const cacheKey = `menu:${restaurantId}`;
    let cachedMenu;
    try {
      const cachedValue = await redisClient.get(cacheKey);
      cachedMenu = cachedValue ? JSON.parse(cachedValue) : null;
    } catch (error) {
      console.error('Error getting cached menu:', error);
      cachedMenu = null;
    }
    
    if (cachedMenu) {
      res.status(200).json({
        success: true,
        message: 'Menu retrieved successfully',
        data: { menuItems: cachedMenu }
      });
      return;
    }
    
    // If not cached, fetch from database
    const restaurantMenuItems = await menuService.getMenuByRestaurantId(restaurantId);
    
    // Store in cache for 10 minutes to improve performance
    try {
      await redisClient.setEx(cacheKey, 600, JSON.stringify(restaurantMenuItems));
    } catch (error) {
      console.error('Error caching menu:', error);
    }
    
    res.status(200).json({
      success: true,
      message: 'Menu retrieved successfully',
      data: { menuItems: restaurantMenuItems }
    });
  } catch (error) {
    next(error);
  }
};

export const updateMenuItem = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new AppError('User not authenticated', 401);
    }

    const { id } = req.params;
    const { name, description, price, category, isActive, isAvailable } = req.body;
    
    // Check if a new image was uploaded
    let imagePath: string | undefined;
    if (req.file) {
      imagePath = `/uploads/menu/${req.file.filename}`;
    }

    const updatedMenuItem = await menuService.updateMenuItem(id, {
      name,
      description,
      price: parseFloat(price),
      category,
      image: imagePath,
      isActive: isActive !== undefined ? isActive === 'true' : undefined,
      isAvailable: isAvailable !== undefined ? isAvailable === 'true' : undefined
    });

    // Clear the cached menu for this restaurant since we changed an item
    try {
      const redisClient = getRedisClient();
      const restaurantId = updatedMenuItem.restaurant.id;
      await redisClient.del(`menu:${restaurantId}`);
    } catch (error) {
      console.error('Error invalidating cache:', error);
    }

    res.status(200).json({
      success: true,
      message: 'Menu item updated successfully',
      data: { menuItem: updatedMenuItem }
    });
  } catch (error) {
    next(error);
  }
};

export const deleteMenuItem = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new AppError('User not authenticated', 401);
    }

    const { id } = req.params;
    // Need to get the menu item before deletion to get the restaurant ID
    const menuItemToDelete = await menuService.getMenuItemById(id);
    await menuService.deleteMenuItem(id);

    // Clear the cached menu for this restaurant since we removed an item
    try {
      const redisClient = getRedisClient();
      const restaurantId = menuItemToDelete.restaurant.id;
      await redisClient.del(`menu:${restaurantId}`);
    } catch (error) {
      console.error('Error invalidating cache:', error);
    }

    res.status(200).json({
      success: true,
      message: 'Menu item deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};