import { Router } from 'express';
import { 
  createMenuItem, 
  getMenuItemById, 
  getMenuByRestaurantId, 
  updateMenuItem, 
  deleteMenuItem,
  upload
} from '../controllers/menuController';
import { authenticate } from '../middlewares/auth';
import { requireRole } from '../middlewares/roleAuth';
import { UserRole } from '../types/enums';
import { validate } from '../middlewares/validation';
import { createMenuItemSchema, updateMenuItemSchema } from '../validators';

const router = Router();

// Public routes
router.get('/restaurant/:restaurantId', getMenuByRestaurantId);
router.get('/:id', getMenuItemById);

// Protected routes
router.post('/', authenticate, requireRole(UserRole.ADMIN, UserRole.RESTAURANT_OWNER), upload.single('image'), validate(createMenuItemSchema), createMenuItem);
router.put('/:id', authenticate, requireRole(UserRole.ADMIN, UserRole.RESTAURANT_OWNER), upload.single('image'), validate(updateMenuItemSchema), updateMenuItem);
router.delete('/:id', authenticate, requireRole(UserRole.ADMIN, UserRole.RESTAURANT_OWNER), deleteMenuItem);

export default router;