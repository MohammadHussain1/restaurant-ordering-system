import { DataSource } from 'typeorm';
import { User } from '../models/User';
import { Restaurant } from '../models/Restaurant';
import { MenuItem } from '../models/MenuItem';
import { Order } from '../models/Order';
import { OrderItem } from '../models/OrderItem';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'restaurant_db',
  synchronize: process.env.NODE_ENV !== 'production', // Only in development
  logging: false,
  entities: [User, Restaurant, MenuItem, Order, OrderItem],
  migrations: [],
  subscribers: [],
});