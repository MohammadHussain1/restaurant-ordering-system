import { Server, Socket } from 'socket.io';
import { createServer } from 'http';
import { Server as HttpServer } from 'http';
import { setSocketIO } from '../controllers/orderController';

interface ExtendedSocket extends Socket {
  userId?: string;
  restaurantId?: string;
}

export const initializeSocketIO = (server: HttpServer): Server => {
  const io = new Server(server, {
    cors: {
      origin: process.env.SOCKET_IO_CORS_ORIGIN || 'http://localhost:3000',
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket: ExtendedSocket) => {
    console.log('A user connected:', socket.id);

    // Join room based on user type
    socket.on('joinRestaurantRoom', (restaurantId: string) => {
      socket.join(`restaurant_${restaurantId}`);
      console.log(`User ${socket.id} joined restaurant room: restaurant_${restaurantId}`);
    });

    // Join order-specific room for customers
    socket.on('joinOrderRoom', (orderId: string) => {
      socket.join(`order_${orderId}`);
      console.log(`User ${socket.id} joined order room: order_${orderId}`);
    });

    // Join room for user-specific notifications
    socket.on('joinUserRoom', (userId: string) => {
      socket.join(`user_${userId}`);
      socket.userId = userId;
      console.log(`User ${socket.id} joined user room: user_${userId}`);
    });

    socket.on('disconnect', () => {
      console.log('A user disconnected:', socket.id);
    });
  });

  // Set the socket.io instance for use in controllers
  setSocketIO(io);

  return io;
};