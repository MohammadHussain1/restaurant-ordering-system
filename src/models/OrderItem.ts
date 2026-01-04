import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { Order } from './Order';
import { MenuItem } from './MenuItem';

@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('int')
  quantity!: number;

  @Column('decimal', { precision: 10, scale: 2 })
  price!: number; // Price at the time of order

  @ManyToOne(() => Order, order => order.orderItems)
  order!: Order;

  @ManyToOne(() => MenuItem)
  menuItem!: MenuItem;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}