import jwt from 'jsonwebtoken';
import { User } from '../models/User';



// JWT payload structure
interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

export const generateAccessToken = (user: User): string => {
  // Create access token that expires in 1 hour
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role,
    } as TokenPayload,
    process.env.JWT_SECRET || 'fallback_secret',
    { expiresIn: process.env.JWT_EXPIRES_IN || '1h' } as jwt.SignOptions
  );
};

export const generateRefreshToken = (user: User): string => {
  // Create refresh token that expires in 7 days
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role,
    } as TokenPayload,
    process.env.REFRESH_JWT_SECRET || 'fallback_refresh_secret',
    { expiresIn: process.env.REFRESH_JWT_EXPIRES_IN || '7d' } as jwt.SignOptions
  );
};

export const verifyToken = (token: string): TokenPayload | null => {
  // Check if JWT is valid
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret') as TokenPayload;
    return decoded;
  } catch (error) {
    // Return null if token expired or invalid
    return null;
  }
};