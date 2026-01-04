import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany } from 'typeorm';
import { User } from './User';
import { MenuItem } from './MenuItem';
import { Order } from './Order';

@Entity('restaurants')
export class Restaurant {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column({ unique: true })
  slug!: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ nullable: true })
  address?: string;

  @Column({ nullable: true })
  city?: string;

  @Column({ nullable: true })
  state?: string;

  @Column({ nullable: true })
  zipCode?: string;

  @Column({ nullable: true })
  phone?: string;

  @Column({ nullable: true })
  image?: string;

  @Column({ default: true })
  isActive!: boolean;

  @ManyToOne(() => User, user => user.restaurants)
  owner!: User;

  @OneToMany(() => MenuItem, menuItem => menuItem.restaurant)
  menuItems!: MenuItem[];

  @OneToMany(() => Order, order => order.restaurant)
  orders!: Order[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}