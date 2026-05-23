import jwt, { JwtPayload } from 'jsonwebtoken';
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
    const decoded = jwt.verify(token, JWT_SECRET) as unknown;
    if (typeof decoded === 'string') return null;
    const payload = decoded as JwtPayload;
    if (!payload.sub || !payload.email || !payload.role) return null;
      const sub = typeof payload.sub === 'string' ? parseInt(payload.sub, 10) : payload.sub;
      return {
        sub,
        email: payload.email as string,
        role: payload.role as string,
      };
  } catch {
    return null;
  }
}
