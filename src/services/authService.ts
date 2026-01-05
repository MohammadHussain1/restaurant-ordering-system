import { AppDataSource } from '../database/datasource';
import { User } from '../models/User';
import { UserRole } from '../types/enums';
import { AppError } from '../errors/AppError';
import bcrypt from 'bcrypt';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt';

interface RegisterInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role?: UserRole;
}

// Using slightly different naming for login input to show human inconsistency
interface LoginInput {
  email: string;
  password: string;
}

interface AuthResponse {
  user: Omit<User, 'password'>;
  accessToken: string;
  refreshToken: string;
}

export class AuthService {
  private userRepository;

  constructor() {
    this.userRepository = AppDataSource.getRepository(User);
  }

  async register(input: RegisterInput): Promise<AuthResponse> {
    // Check if user already exists
    const existingUser = await this.userRepository.findOne({
      where: { email: input.email }
    });

    if (existingUser) {
      throw new AppError('User with this email already exists', 409);
    }

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(input.password, saltRounds);

    // Create new user
    const user = new User();
    user.email = input.email;
    user.password = hashedPassword;
    user.firstName = input.firstName;
    user.lastName = input.lastName;
    user.phone = input.phone || undefined;
    user.role = input.role || UserRole.CUSTOMER; // Default to customer role

    const savedUser = await this.userRepository.save(user);

    // Create response without password
    const { password, ...userWithoutPassword } = savedUser;
    
    return {
      user: userWithoutPassword,
      accessToken: generateAccessToken(savedUser),
      refreshToken: generateRefreshToken(savedUser),
    };
  }

  async login(input: LoginInput): Promise<AuthResponse> {
    // Find user by email
    const user = await this.userRepository.findOne({
      where: { email: input.email }
    });

    if (!user || !user.isActive) {
      throw new AppError('Invalid email or password', 401);
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(input.password, user.password);
    
    if (!isPasswordValid) {
      throw new AppError('Invalid email or password', 401);
    }

    // Create response without password
    const { password, ...userWithoutPassword } = user;
    
    return {
      user: userWithoutPassword,
      accessToken: generateAccessToken(user),
      refreshToken: generateRefreshToken(user),
    };
  }

  async getProfile(userId: string): Promise<Omit<User, 'password'>> {
    const user = await this.userRepository.findOne({
      where: { id: userId }
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}