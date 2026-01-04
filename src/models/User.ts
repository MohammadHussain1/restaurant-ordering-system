import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Restaurant } from './Restaurant';
import { Order } from './Order';

export enum UserRole {
  ADMIN = 'admin',
  RESTAURANT_OWNER = 'restaurant_owner',
  CUSTOMER = 'customer',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  password!: string;

  @Column()
  firstName!: string;

  @Column()
  lastName!: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.CUSTOMER,
  })
  role!: UserRole;

  @Column({ nullable: true })
  phone?: string;

  @Column({ default: true })
  isActive!: boolean;

  @OneToMany(() => Restaurant, restaurant => restaurant.owner)
  restaurants!: Restaurant[];

  @OneToMany(() => Order, order => order.customer)
  orders!: Order[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}