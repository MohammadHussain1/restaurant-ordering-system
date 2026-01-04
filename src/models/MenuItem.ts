import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { Restaurant } from './Restaurant';

export enum MenuItemCategory {
  APPETIZER = 'appetizer',
  MAIN_COURSE = 'main_course',
  DESSERT = 'dessert',
  BEVERAGE = 'beverage',
  SIDE = 'side',
}

@Entity('menu_items')
export class MenuItem {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column({ nullable: true })
  description?: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price!: number;

  @Column({
    type: 'enum',
    enum: MenuItemCategory,
  })
  category!: MenuItemCategory;

  @Column({ nullable: true })
  image?: string;

  @Column({ default: true })
  isActive!: boolean;

  @Column({ default: true })
  isAvailable!: boolean;

  @ManyToOne(() => Restaurant, restaurant => restaurant.menuItems)
  restaurant!: Restaurant;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}