import { Router } from 'express';
import { 
  createRestaurant, 
  getRestaurantById, 
  getRestaurantBySlug, 
  getAllRestaurants, 
  updateRestaurant, 
  deleteRestaurant 
} from '../controllers/restaurantController';
import { authenticate } from '../middlewares/auth';
import { requireRole, requireRestaurantOwnership } from '../middlewares/roleAuth';
import { UserRole } from '../models/User';
import { validate } from '../middlewares/validation';
import { createRestaurantSchema, updateRestaurantSchema } from '../validators';

const router = Router();

router.get('/', getAllRestaurants);
router.get('/:id', getRestaurantById);
router.get('/slug/:slug', getRestaurantBySlug);

// Protected routes
router.post('/', authenticate, requireRole(UserRole.ADMIN, UserRole.RESTAURANT_OWNER), validate(createRestaurantSchema), createRestaurant);
router.put('/:id', authenticate, requireRestaurantOwnership, validate(updateRestaurantSchema), updateRestaurant);
router.delete('/:id', authenticate, requireRestaurantOwnership, deleteRestaurant);

export default router;