import Joi from 'joi';

// Validation schemas for user registration
export const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  phone: Joi.string().optional(),
  role: Joi.string().valid('admin', 'restaurant_owner', 'customer').optional(),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

// Validation schemas for restaurant management
export const createRestaurantSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().optional(),
  address: Joi.string().optional(),
  city: Joi.string().optional(),
  state: Joi.string().optional(),
  zipCode: Joi.string().optional(),
  phone: Joi.string().optional(),
  image: Joi.string().optional(),
});

export const updateRestaurantSchema = Joi.object({
  name: Joi.string().optional(),
  description: Joi.string().optional(),
  address: Joi.string().optional(),
  city: Joi.string().optional(),
  state: Joi.string().optional(),
  zipCode: Joi.string().optional(),
  phone: Joi.string().optional(),
  image: Joi.string().optional(),
  isActive: Joi.boolean().optional(),
});

// Validation schemas for menu item management
export const createMenuItemSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().optional(),
  price: Joi.number().positive().required(),
  category: Joi.string().required(),
  restaurantId: Joi.string().uuid().required(),
  isActive: Joi.boolean().optional(),
  isAvailable: Joi.boolean().optional(),
});

export const updateMenuItemSchema = Joi.object({
  name: Joi.string().optional(),
  description: Joi.string().optional(),
  price: Joi.number().positive().optional(),
  category: Joi.string().optional(),
  image: Joi.string().optional(),
  isActive: Joi.boolean().optional(),
  isAvailable: Joi.boolean().optional(),
});

// Validation schemas for order management
export const createOrderSchema = Joi.object({
  restaurantId: Joi.string().uuid().required(),
  orderItems: Joi.array()
    .items(
      Joi.object({
        menuItemId: Joi.string().uuid().required(),
        quantity: Joi.number().integer().min(1).required(),
      })
    )
    .min(1)
    .required(),
  customerNote: Joi.string().optional(),
  deliveryAddress: Joi.string().optional(),
});