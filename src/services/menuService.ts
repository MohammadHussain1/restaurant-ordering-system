import { AppDataSource } from '../database/datasource';
import { MenuItem } from '../models/MenuItem';
import { Restaurant } from '../models/Restaurant';
import { AppError } from '../errors/AppError';

interface CreateMenuItemInput {
  name: string;
  description?: string;
  price: number;
  category: string;
  image?: string;
  restaurantId: string;
  isActive?: boolean;
  isAvailable?: boolean;
}

interface UpdateMenuItemInput {
  name?: string;
  description?: string;
  price?: number;
  category?: string;
  image?: string;
  isActive?: boolean;
  isAvailable?: boolean;
}

export class MenuService {
  private menuItemRepository = AppDataSource.getRepository(MenuItem);
  private restaurantRepository = AppDataSource.getRepository(Restaurant);

  async createMenuItem(input: CreateMenuItemInput): Promise<MenuItem> {
    // Check if restaurant exists
    const restaurant = await this.restaurantRepository.findOne({
      where: { id: input.restaurantId }
    });

    if (!restaurant) {
      throw new AppError('Restaurant not found', 404);
    }

    // Create menu item
    const menuItem = new MenuItem();
    menuItem.name = input.name;
    menuItem.description = input.description || undefined;
    menuItem.price = input.price;
    menuItem.category = input.category as any; // Type assertion since category is an enum
    menuItem.image = input.image || undefined;
    menuItem.isActive = input.isActive !== undefined ? input.isActive : true;
    menuItem.isAvailable = input.isAvailable !== undefined ? input.isAvailable : true;
    menuItem.restaurant = restaurant;

    return await this.menuItemRepository.save(menuItem);
  }

  async getMenuItemById(id: string): Promise<MenuItem> {
    const menuItem = await this.menuItemRepository.findOne({
      where: { id },
      relations: ['restaurant']
    });

    if (!menuItem) {
      throw new AppError('Menu item not found', 404);
    }

    return menuItem;
  }

  async getMenuByRestaurantId(restaurantId: string): Promise<MenuItem[]> {
    return await this.menuItemRepository.find({
      where: { 
        restaurant: { id: restaurantId },
        isActive: true,
        isAvailable: true
      },
      order: { createdAt: 'ASC' }
    });
  }

  async updateMenuItem(id: string, input: UpdateMenuItemInput): Promise<MenuItem> {
    const menuItem = await this.menuItemRepository.findOne({
      where: { id },
      relations: ['restaurant']
    });

    if (!menuItem) {
      throw new AppError('Menu item not found', 404);
    }

    // Update menu item fields
    if (input.name) menuItem.name = input.name;
    if (input.description !== undefined) menuItem.description = input.description;
    if (input.price) menuItem.price = input.price;
    if (input.category) menuItem.category = input.category as any;
    if (input.image !== undefined) menuItem.image = input.image;
    if (input.isActive !== undefined) menuItem.isActive = input.isActive;
    if (input.isAvailable !== undefined) menuItem.isAvailable = input.isAvailable;

    return await this.menuItemRepository.save(menuItem);
  }

  async deleteMenuItem(id: string): Promise<void> {
    const menuItem = await this.menuItemRepository.findOne({
      where: { id }
    });

    if (!menuItem) {
      throw new AppError('Menu item not found', 404);
    }

    menuItem.isActive = false;
    await this.menuItemRepository.save(menuItem);
  }
}