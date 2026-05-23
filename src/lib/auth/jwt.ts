import jwt from 'jsonwebtoken';
import { User } from '@/lib/db/models';

const JWT_SECRET = process.env.JWT_SECRET || 'change-me-in-.env';
const JWT_EXPIRES_IN = '7d';

export interface AuthTokenPayload {
  sub: number; // user id
  email: string;
  role: string;
}

export function signToken(user: User): string {
  const payload: AuthTokenPayload = {
    sub: user.id,
    email: user.email,
    role: user.role,
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token: string): AuthTokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthTokenPayload;
  } catch {
    return null;
  }
}
