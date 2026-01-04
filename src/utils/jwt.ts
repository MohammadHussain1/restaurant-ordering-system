import jwt from 'jsonwebtoken';
import { User } from '../models/User';

interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

export const generateAccessToken = (user: User): string => {
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
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret') as TokenPayload;
    return decoded;
  } catch (error) {
    return null;
  }
};