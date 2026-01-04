import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany } from 'typeorm';
import { User } from './User';
import { Restaurant } from './Restaurant';
import { OrderItem } from './OrderItem';
import { OrderStatus, PaymentStatus } from '../types/enums';


@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  status!: OrderStatus;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  paymentStatus!: PaymentStatus;

  @Column('decimal', { precision: 10, scale: 2 })
  totalPrice!: number;

  @Column({ nullable: true })
  customerNote?: string;

  @Column({ nullable: true })
  deliveryAddress?: string;

  @ManyToOne(() => User, user => user.orders)
  customer!: User;

  @ManyToOne(() => Restaurant, restaurant => restaurant.orders)
  restaurant!: Restaurant;

  @OneToMany(() => OrderItem, orderItem => orderItem.order, { cascade: true })
  orderItems!: OrderItem[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}