import { AppDataSource } from '../database/datasource';
import { Order, OrderStatus, PaymentStatus } from '../models/Order';
import { OrderItem } from '../models/OrderItem';
import { User } from '../models/User';
import { Restaurant } from '../models/Restaurant';
import { MenuItem } from '../models/MenuItem';
import { AppError } from '../errors/AppError';
import { In } from 'typeorm';

interface CreateOrderInput {
  restaurantId: string;
  orderItems: {
    menuItemId: string;
    quantity: number;
  }[];
  customerNote?: string;
  deliveryAddress?: string;
  customerId: string;
}

interface UpdateOrderStatusInput {
  orderId: string;
  status: OrderStatus;
  updatedBy: string; // ID of the user updating the status
}

export class OrderService {
  private orderRepository = AppDataSource.getRepository(Order);
  private orderItemRepository = AppDataSource.getRepository(OrderItem);
  private userRepository = AppDataSource.getRepository(User);
  private restaurantRepository = AppDataSource.getRepository(Restaurant);
  private menuItemRepository = AppDataSource.getRepository(MenuItem);

  async createOrder(input: CreateOrderInput): Promise<Order> {
    // Start a transaction
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Verify customer exists
      const customer = await queryRunner.manager.findOne(User, {
        where: { id: input.customerId }
      });

      if (!customer) {
        throw new AppError('Customer not found', 404);
      }

      // Verify restaurant exists
      const restaurant = await queryRunner.manager.findOne(Restaurant, {
        where: { id: input.restaurantId }
      });

      if (!restaurant) {
        throw new AppError('Restaurant not found', 404);
      }

      // Fetch menu items and validate availability
      const menuItemIds = input.orderItems.map(item => item.menuItemId);
      const menuItems = await queryRunner.manager.find(MenuItem, {
        where: { 
          id: In(menuItemIds),
          isAvailable: true,
          isActive: true
        }
      });

      if (menuItems.length !== menuItemIds.length) {
        throw new AppError('One or more menu items are not available', 400);
      }

      // Create order
      const order = new Order();
      order.restaurant = restaurant;
      order.customer = customer;
      order.customerNote = input.customerNote || undefined;
      order.deliveryAddress = input.deliveryAddress || undefined;
      order.status = OrderStatus.PENDING;
      order.paymentStatus = PaymentStatus.PENDING;

      // Calculate total price
      let totalPrice = 0;
      const orderItems: OrderItem[] = [];

      for (const item of input.orderItems) {
        const menuItem = menuItems.find(mi => mi.id === item.menuItemId);
        if (!menuItem) {
          throw new AppError(`Menu item ${item.menuItemId} not found`, 404);
        }

        const orderItem = new OrderItem();
        orderItem.menuItem = menuItem;
        orderItem.quantity = item.quantity;
        orderItem.price = menuItem.price; // Store the price at the time of order
        orderItems.push(orderItem);

        totalPrice += menuItem.price * item.quantity;
      }

      order.totalPrice = totalPrice;
      order.orderItems = orderItems;

      // Save the order with its items
      const savedOrder = await queryRunner.manager.save(order);
      
      // Simulate payment processing with delay
      await this.simulatePaymentProcessing(savedOrder.id);
      
      // Commit the transaction
      await queryRunner.commitTransaction();

      // Fetch the complete order with relations
      const completeOrder = await this.orderRepository.findOne({
        where: { id: savedOrder.id },
        relations: ['orderItems', 'orderItems.menuItem', 'restaurant', 'customer']
      });

      return completeOrder!;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private async simulatePaymentProcessing(orderId: string): Promise<void> {
    // Introduce 1-3 seconds delay to simulate payment processing
    const delay = Math.floor(Math.random() * 2000) + 1000; // 1-3 seconds
    await new Promise(resolve => setTimeout(resolve, delay));

    // Randomize payment result (90% success rate)
    const paymentSuccess = Math.random() < 0.9;
    
    // Update payment status in database
    const order = await this.orderRepository.findOne({
      where: { id: orderId }
    });

    if (order) {
      order.paymentStatus = paymentSuccess ? PaymentStatus.SUCCESS : PaymentStatus.FAILED;
      await this.orderRepository.save(order);
    }
  }

  async getOrderById(orderId: string, userId: string, userRole: string): Promise<Order> {
    let order: Order | null;
    
    if (userRole === 'admin') {
      // Admin can access any order
      order = await this.orderRepository.findOne({
        where: { id: orderId },
        relations: ['orderItems', 'orderItems.menuItem', 'restaurant', 'customer']
      });
    } else {
      // Regular users can only access their own orders
      order = await this.orderRepository.findOne({
        where: { 
          id: orderId,
          customer: { id: userId }
        },
        relations: ['orderItems', 'orderItems.menuItem', 'restaurant', 'customer']
      });
    }

    if (!order) {
      throw new AppError('Order not found', 404);
    }

    return order;
  }

  async getOrdersByCustomerId(customerId: string): Promise<Order[]> {
    return await this.orderRepository.find({
      where: { 
        customer: { id: customerId }
      },
      order: { createdAt: 'DESC' },
      relations: ['orderItems', 'orderItems.menuItem', 'restaurant']
    });
  }

  async getOrdersByRestaurantId(restaurantId: string, userId: string, userRole: string): Promise<Order[]> {
    // Check if user is the restaurant owner or admin
    if (userRole !== 'admin') {
      const restaurant = await this.restaurantRepository.findOne({
        where: { id: restaurantId }
      });

      if (!restaurant || restaurant.owner.id !== userId) {
        throw new AppError('You do not have permission to view orders for this restaurant', 403);
      }
    }

    return await this.orderRepository.find({
      where: { 
        restaurant: { id: restaurantId }
      },
      order: { createdAt: 'DESC' },
      relations: ['orderItems', 'orderItems.menuItem', 'customer']
    });
  }

  async updateOrderStatus(input: UpdateOrderStatusInput): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id: input.orderId },
      relations: ['restaurant', 'restaurant.owner']
    });

    if (!order) {
      throw new AppError('Order not found', 404);
    }

    // Check if user is restaurant owner or admin
    if (input.updatedBy !== order.restaurant.owner.id) {
      // Additional check for admin role
      const user = await this.userRepository.findOne({ where: { id: input.updatedBy } });
      if (user?.role !== 'admin') {
        throw new AppError('You do not have permission to update this order status', 403);
      }
    }

    // Update status
    order.status = input.status;
    return await this.orderRepository.save(order);
  }
}