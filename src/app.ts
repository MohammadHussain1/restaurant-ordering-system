import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import 'reflect-metadata';
import { AppDataSource } from './database/datasource';
import { connectRedis } from './config/redis';
import { attachJSONMethods } from './utils/redis';
import { errorHandler, notFound } from './middlewares/errorHandler';
import { generalRateLimiter, authRateLimiter, userRateLimiter } from './middlewares/rateLimiter';
import authRoutes from './routes/auth';
import restaurantRoutes from './routes/restaurant';
import menuRoutes from './routes/menu';
import orderRoutes from './routes/order';
import { getRedisClient } from './config/redis';

class App {
  public app: Application;

  constructor() {
    this.app = express();
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private initializeMiddlewares(): void {
    // Security middleware
    this.app.use(helmet());
    
    // Enable CORS
    this.app.use(cors({
      origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
      credentials: true
    }));
    
    // Rate limiting
    this.app.use(generalRateLimiter);
    
    // Parse JSON
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true }));
    
    // Serve static files for uploaded images
    this.app.use('/uploads', express.static('uploads'));
  }

  private initializeRoutes(): void {
    // Apply auth rate limiter to auth routes
    this.app.use('/api/auth', authRateLimiter, authRoutes);
    // Apply user rate limiter to protected routes
    this.app.use('/api/restaurants', userRateLimiter, restaurantRoutes);
    this.app.use('/api/menu', userRateLimiter, menuRoutes);
    this.app.use('/api/orders', userRateLimiter, orderRoutes);

    // Health check endpoint
    this.app.get('/health', (req: Request, res: Response) => {
      res.status(200).json({
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString()
      });
    });
  }

  private initializeErrorHandling(): void {
    this.app.use(notFound);
    this.app.use(errorHandler);
  }

  public async initialize(): Promise<void> {
    try {
      // Connect to database
      await AppDataSource.initialize();
      console.log('Connected to the database');

      // Connect to Redis and attach JSON methods
      await connectRedis();
      const redisClient = getRedisClient();
      attachJSONMethods(redisClient);
      console.log('Connected to Redis');

    } catch (error) {
      console.error('Error during app initialization:', error);
      process.exit(1);
    }
  }

  public listen(port: number): void {
    this.app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  }
}

export default App;