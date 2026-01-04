import { Router } from 'express';
import { 
  createOrder, 
  getOrderById, 
  getOrdersByCustomer, 
  getOrdersByRestaurant, 
  updateOrderStatus 
} from '../controllers/orderController';
import { authenticate } from '../middlewares/auth';
import { requireRole } from '../middlewares/roleAuth';
import { UserRole } from '../types/enums';
import { validate } from '../middlewares/validation';
import { createOrderSchema } from '../validators';

const router = Router();

// Protected routes for customers
router.post('/', authenticate, requireRole(UserRole.CUSTOMER, UserRole.ADMIN), validate(createOrderSchema), createOrder);
router.get('/', authenticate, requireRole(UserRole.CUSTOMER, UserRole.ADMIN), getOrdersByCustomer);
router.get('/:id', authenticate, getOrdersByCustomer); // Customer can only get their own orders

// Protected routes for restaurant owners
router.get('/restaurant/:restaurantId', authenticate, requireRole(UserRole.RESTAURANT_OWNER, UserRole.ADMIN), getOrdersByRestaurant);
router.put('/:id/status', authenticate, requireRole(UserRole.RESTAURANT_OWNER, UserRole.ADMIN), updateOrderStatus);

export default router;