import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { AppError } from '../errors/AppError';

export interface AuthUser {
  id: number;
  role: string;
  email?: string;
  name?: string | null;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

/** Requires a valid "Authorization: Bearer <token>" header. */
export function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return next(new AppError(401, 'Authentication required'));
  }

  try {
    const payload = jwt.verify(header.slice(7), env.jwtSecret) as jwt.JwtPayload;
    req.user = {
      id: Number(payload.sub),
      role: payload.role,
      email: payload.email,
      name: payload.name,
    };
    next();
  } catch {
    next(new AppError(401, 'Invalid or expired token'));
  }
}

/** Must run after authenticate. Only lets admin users through. */
export function requireAdmin(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  if (req.user?.role !== 'admin') {
    return next(new AppError(403, 'Admin access required'));
  }
  next();
}

/** Must run after authenticate. Admins manage stock; only customers can buy. */
export function requireCustomer(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  if (req.user?.role === 'admin') {
    return next(new AppError(403, 'Admins cannot purchase vehicles'));
  }
  next();
}