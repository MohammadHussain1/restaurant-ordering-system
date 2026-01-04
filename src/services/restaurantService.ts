import { AppDataSource } from '../database/datasource';
import { Restaurant } from '../models/Restaurant';
import { User } from '../models/User';
import { AppError } from '../errors/AppError';

interface CreateRestaurantInput {
  name: string;
  description?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  phone?: string;
  image?: string;
  ownerId: string;
}

interface UpdateRestaurantInput {
  name?: string;
  description?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  phone?: string;
  image?: string;
  isActive?: boolean;
}

export class RestaurantService {
  private restaurantRepository = AppDataSource.getRepository(Restaurant);
  private userRepository = AppDataSource.getRepository(User);

  async createRestaurant(input: CreateRestaurantInput): Promise<Restaurant> {
    // Check if user exists and is restaurant owner
    const owner = await this.userRepository.findOne({
      where: { id: input.ownerId }
    });

    if (!owner) {
      throw new AppError('Owner not found', 404);
    }

    // Check if user has permission to create restaurant
    if (owner.role !== 'admin' && owner.role !== 'restaurant_owner') {
      throw new AppError('Only admin and restaurant owners can create restaurants', 403);
    }

    // Generate slug from name
    const slug = input.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Check if slug already exists
    const existingRestaurant = await this.restaurantRepository.findOne({
      where: { slug }
    });

    if (existingRestaurant) {
      throw new AppError('Restaurant with this name already exists', 409);
    }

    // Create restaurant
    const restaurant = new Restaurant();
    restaurant.name = input.name;
    restaurant.slug = slug;
    restaurant.description = input.description || undefined;
    restaurant.address = input.address || undefined;
    restaurant.city = input.city || undefined;
    restaurant.state = input.state || undefined;
    restaurant.zipCode = input.zipCode || undefined;
    restaurant.phone = input.phone || undefined;
    restaurant.image = input.image || undefined;
    restaurant.isActive = true;
    restaurant.owner = owner;

    return await this.restaurantRepository.save(restaurant);
  }

  async getRestaurantById(id: string): Promise<Restaurant> {
    const restaurant = await this.restaurantRepository.findOne({
      where: { id },
      relations: ['owner']
    });

    if (!restaurant) {
      throw new AppError('Restaurant not found', 404);
    }

    return restaurant;
  }

  async getRestaurantBySlug(slug: string): Promise<Restaurant> {
    const restaurant = await this.restaurantRepository.findOne({
      where: { slug },
      relations: ['owner']
    });

    if (!restaurant) {
      throw new AppError('Restaurant not found', 404);
    }

    return restaurant;
  }

  async getAllRestaurants(): Promise<Restaurant[]> {
    return await this.restaurantRepository.find({
      where: { isActive: true },
      relations: ['owner']
    });
  }

  async updateRestaurant(id: string, input: UpdateRestaurantInput, userId: string): Promise<Restaurant> {
    const restaurant = await this.restaurantRepository.findOne({
      where: { id },
      relations: ['owner']
    });

    if (!restaurant) {
      throw new AppError('Restaurant not found', 404);
    }

    // Check if user is the owner or admin
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (user.role !== 'admin' && restaurant.owner.id !== userId) {
      throw new AppError('You do not have permission to update this restaurant', 403);
    }

    // Update restaurant fields
    if (input.name) {
      restaurant.name = input.name;
      // If name changed, update slug too
      restaurant.slug = input.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    }
    if (input.description !== undefined) restaurant.description = input.description;
    if (input.address !== undefined) restaurant.address = input.address;
    if (input.city !== undefined) restaurant.city = input.city;
    if (input.state !== undefined) restaurant.state = input.state;
    if (input.zipCode !== undefined) restaurant.zipCode = input.zipCode;
    if (input.phone !== undefined) restaurant.phone = input.phone;
    if (input.image !== undefined) restaurant.image = input.image;
    if (input.isActive !== undefined) restaurant.isActive = input.isActive;

    return await this.restaurantRepository.save(restaurant);
  }

  async deleteRestaurant(id: string, userId: string): Promise<void> {
    const restaurant = await this.restaurantRepository.findOne({
      where: { id },
      relations: ['owner']
    });

    if (!restaurant) {
      throw new AppError('Restaurant not found', 404);
    }

    // Check if user is the owner or admin
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (user.role !== 'admin' && restaurant.owner.id !== userId) {
      throw new AppError('You do not have permission to delete this restaurant', 403);
    }

    restaurant.isActive = false;
    await this.restaurantRepository.save(restaurant);
  }
}