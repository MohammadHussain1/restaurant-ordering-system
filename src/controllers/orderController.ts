import { Request, Response, NextFunction } from 'express';
import { OrderService } from '../services/orderService';
import { AppError } from '../errors/AppError';
import { AuthenticatedRequest } from '../middlewares/auth';
import { OrderStatus } from '../types/enums';
import { Server } from 'socket.io';
import { getRedisClient } from '../config/redis';

let io: Server | null = null;

export const setSocketIO = (socketIo: Server) => {
  io = socketIo;
};

const orderService = new OrderService();

export const createOrder = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new AppError('User not authenticated', 401);
    }

    const { restaurantId, orderItems, customerNote, deliveryAddress } = req.body;

    const order = await orderService.createOrder({
      restaurantId,
      orderItems,
      customerNote,
      deliveryAddress,
      customerId: req.user.id
    });

    // Emit order created event to relevant restaurant owner
    if (io) {
      io.to(`restaurant_${order.restaurant.id}`).emit('orderCreated', {
        order,
        message: 'New order received'
      });
    }

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: { order }
    });
  } catch (error) {
    next(error);
  }
};

export const getOrderById = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new AppError('User not authenticated', 401);
    }

    const { id } = req.params;
    const order = await orderService.getOrderById(id, req.user.id, req.user.role);

    res.status(200).json({
      success: true,
      message: 'Order retrieved successfully',
      data: { order }
    });
  } catch (error) {
    next(error);
  }
};

export const getOrdersByCustomer = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new AppError('User not authenticated', 401);
    }

    const orders = await orderService.getOrdersByCustomerId(req.user.id);

    res.status(200).json({
      success: true,
      message: 'Orders retrieved successfully',
      data: { orders }
    });
  } catch (error) {
    next(error);
  }
};

export const getOrdersByRestaurant = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new AppError('User not authenticated', 401);
    }

    const { restaurantId } = req.params;
    const orders = await orderService.getOrdersByRestaurantId(restaurantId, req.user.id, req.user.role);

    res.status(200).json({
      success: true,
      message: 'Orders retrieved successfully',
      data: { orders }
    });
  } catch (error) {
    next(error);
  }
};

export const updateOrderStatus = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new AppError('User not authenticated', 401);
    }

    const { id } = req.params;
    const { status } = req.body;

    // Validate status
    const validStatuses = Object.values(OrderStatus);
    if (!validStatuses.includes(status as OrderStatus)) {
      throw new AppError('Invalid order status', 400);
    }

    const order = await orderService.updateOrderStatus({
      orderId: id,
      status: status as OrderStatus,
      updatedBy: req.user.id
    });

    // Emit order status update to customer
    if (io) {
      io.to(`order_${order.id}`).emit('orderStatusUpdated', {
        orderId: order.id,
        status: order.status,
        message: `Order status updated to ${order.status}`
      });
    }

    res.status(200).json({
      success: true,
      message: 'Order status updated successfully',
      data: { order }
    });
  } catch (error) {
    next(error);
  }
};