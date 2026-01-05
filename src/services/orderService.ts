import { AppDataSource } from '../database/datasource';
import { Order } from '../models/Order';
import { OrderStatus, PaymentStatus } from '../types/enums';
import { OrderItem } from '../models/OrderItem';
import { User } from '../models/User';
import { Restaurant } from '../models/Restaurant';
import { MenuItem } from '../models/MenuItem';
import { AppError } from '../errors/AppError';
import { In, EntityManager } from 'typeorm';

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

interface OrderResponse {
  id: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  totalPrice: number;
  customerNote?: string;
  deliveryAddress?: string;
  createdAt: Date;
  updatedAt: Date;
  customer: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    role: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  };
  restaurant: {
    id: string;
    name: string;
    slug: string;
    description?: string;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    phone?: string;
    image?: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  };
  orderItems: {
    id: string;
    quantity: number;
    price: number;
    createdAt: Date;
    updatedAt: Date;
    menuItem: {
      id: string;
      name: string;
      description?: string;
      price: number;
      category: string;
      image?: string;
      isActive: boolean;
      isAvailable: boolean;
      createdAt: Date;
      updatedAt: Date;
    };
  }[];
}

export class OrderService {
  private orderRepository = AppDataSource.getRepository(Order);
  private orderItemRepository = AppDataSource.getRepository(OrderItem);
  private userRepository = AppDataSource.getRepository(User);
  private restaurantRepository = AppDataSource.getRepository(Restaurant);
  private menuItemRepository = AppDataSource.getRepository(MenuItem);

  async createOrder(input: CreateOrderInput): Promise<OrderResponse> {
    // Start a transaction
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Verify customer exists
      const customer = await queryRunner.manager.findOne(User, {
        where: { id: input.customerId },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true
        }
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
      order.customer = customer as any; // Type assertion since we're selecting specific fields
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
      
      // Simulate payment processing with delay as part of the transaction
      await this.simulatePaymentProcessing(savedOrder.id, queryRunner.manager);
      
      // Commit the transaction
      await queryRunner.commitTransaction();

      // Fetch the complete order with relations using database-level selection
      const completeOrder = await this.orderRepository.findOne({
        where: { id: savedOrder.id },
        relations: ['orderItems', 'orderItems.menuItem', 'restaurant', 'customer'],
        select: {
          id: true,
          status: true,
          paymentStatus: true,
          totalPrice: true,
          customerNote: true,
          deliveryAddress: true,
          createdAt: true,
          updatedAt: true,
          customer: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
            role: true,
            isActive: true,
            createdAt: true,
            updatedAt: true
          },
          restaurant: {
            id: true,
            name: true,
            slug: true,
            description: true,
            address: true,
            city: true,
            state: true,
            zipCode: true,
            phone: true,
            image: true,
            isActive: true,
            createdAt: true,
            updatedAt: true
          },
          orderItems: {
            id: true,
            quantity: true,
            price: true,
            createdAt: true,
            updatedAt: true,
            menuItem: {
              id: true,
              name: true,
              description: true,
              price: true,
              category: true,
              image: true,
              isActive: true,
              isAvailable: true,
              createdAt: true,
              updatedAt: true
            }
          }
        }
      });

      if (!completeOrder) {
        throw new AppError('Order creation failed', 500);
      }

      return completeOrder;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private async simulatePaymentProcessing(orderId: string, entityManager: EntityManager): Promise<void> {
    // Introduce 1-3 seconds delay to simulate payment processing
    const delay = Math.floor(Math.random() * 2000) + 1000; // 1-3 seconds
    await new Promise(resolve => setTimeout(resolve, delay));

    // Randomize payment result (90% success rate)
    const paymentSuccess = Math.random() < 0.9;
    
    // Update payment status in database within the transaction
    await entityManager.update(Order, orderId, {
      paymentStatus: paymentSuccess ? PaymentStatus.SUCCESS : PaymentStatus.FAILED
    });
  }

  async getOrderById(orderId: string, userId: string, userRole: string): Promise<OrderResponse> {
    let order: OrderResponse | null;
    
    if (userRole === 'admin') {
      // Admin can access any order
      order = await this.orderRepository.findOne({
        where: { id: orderId },
        relations: ['orderItems', 'orderItems.menuItem', 'restaurant', 'customer'],
        select: {
          id: true,
          status: true,
          paymentStatus: true,
          totalPrice: true,
          customerNote: true,
          deliveryAddress: true,
          createdAt: true,
          updatedAt: true,
          customer: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
            role: true,
            isActive: true,
            createdAt: true,
            updatedAt: true
          },
          restaurant: {
            id: true,
            name: true,
            slug: true,
            description: true,
            address: true,
            city: true,
            state: true,
            zipCode: true,
            phone: true,
            image: true,
            isActive: true,
            createdAt: true,
            updatedAt: true
          },
          orderItems: {
            id: true,
            quantity: true,
            price: true,
            createdAt: true,
            updatedAt: true,
            menuItem: {
              id: true,
              name: true,
              description: true,
              price: true,
              category: true,
              image: true,
              isActive: true,
              isAvailable: true,
              createdAt: true,
              updatedAt: true
            }
          }
        }
      });
    } else {
      // Regular users can only access their own orders
      order = await this.orderRepository.findOne({
        where: { 
          id: orderId,
          customer: { id: userId }
        },
        relations: ['orderItems', 'orderItems.menuItem', 'restaurant', 'customer'],
        select: {
          id: true,
          status: true,
          paymentStatus: true,
          totalPrice: true,
          customerNote: true,
          deliveryAddress: true,
          createdAt: true,
          updatedAt: true,
          customer: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
            role: true,
            isActive: true,
            createdAt: true,
            updatedAt: true
          },
          restaurant: {
            id: true,
            name: true,
            slug: true,
            description: true,
            address: true,
            city: true,
            state: true,
            zipCode: true,
            phone: true,
            image: true,
            isActive: true,
            createdAt: true,
            updatedAt: true
          },
          orderItems: {
            id: true,
            quantity: true,
            price: true,
            createdAt: true,
            updatedAt: true,
            menuItem: {
              id: true,
              name: true,
              description: true,
              price: true,
              category: true,
              image: true,
              isActive: true,
              isAvailable: true,
              createdAt: true,
              updatedAt: true
            }
          }
        }
      });
    }

    if (!order) {
      throw new AppError('Order not found', 404);
    }

    return order;
  }

  async getOrdersByCustomerId(customerId: string): Promise<OrderResponse[]> {
    return await this.orderRepository.find({
      where: { 
        customer: { id: customerId }
      },
      order: { createdAt: 'DESC' },
      relations: ['orderItems', 'orderItems.menuItem', 'restaurant'],
      select: {
        id: true,
        status: true,
        paymentStatus: true,
        totalPrice: true,
        customerNote: true,
        deliveryAddress: true,
        createdAt: true,
        updatedAt: true,
        customer: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true
        },
        restaurant: {
          id: true,
          name: true,
          slug: true,
          description: true,
          address: true,
          city: true,
          state: true,
          zipCode: true,
          phone: true,
          image: true,
          isActive: true,
          createdAt: true,
          updatedAt: true
        },
        orderItems: {
          id: true,
          quantity: true,
          price: true,
          createdAt: true,
          updatedAt: true,
          menuItem: {
            id: true,
            name: true,
            description: true,
            price: true,
            category: true,
            image: true,
            isActive: true,
            isAvailable: true,
            createdAt: true,
            updatedAt: true
          }
        }
      }
    });
  }

  async getOrdersByRestaurantId(restaurantId: string, userId: string, userRole: string): Promise<OrderResponse[]> {
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
      relations: ['orderItems', 'orderItems.menuItem', 'customer'],
      select: {
        id: true,
        status: true,
        paymentStatus: true,
        totalPrice: true,
        customerNote: true,
        deliveryAddress: true,
        createdAt: true,
        updatedAt: true,
        customer: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true
        },
        restaurant: {
          id: true,
          name: true,
          slug: true,
          description: true,
          address: true,
          city: true,
          state: true,
          zipCode: true,
          phone: true,
          image: true,
          isActive: true,
          createdAt: true,
          updatedAt: true
        },
        orderItems: {
          id: true,
          quantity: true,
          price: true,
          createdAt: true,
          updatedAt: true,
          menuItem: {
            id: true,
            name: true,
            description: true,
            price: true,
            category: true,
            image: true,
            isActive: true,
            isAvailable: true,
            createdAt: true,
            updatedAt: true
          }
        }
      }
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