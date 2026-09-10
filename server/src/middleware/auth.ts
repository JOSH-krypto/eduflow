import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  userId?: string;
  userEmail?: string;
}

const JWT_SECRET = process.env.JWT_SECRET || 'eduflow-secret-key-change-in-production-2026';

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  // 1. Try reading from httpOnly cookie
  let token = req.cookies?.eduflow_token;

  // 2. Fallback to Authorization Bearer header
  if (!token && req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: 'Authentication required. Please sign in.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string };
    req.userId = decoded.userId;
    req.userEmail = decoded.email;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired session token.' });
  }
};

export const optionalAuthMiddleware = (req: AuthRequest, _res: Response, next: NextFunction) => {
  let token = req.cookies?.eduflow_token;
  if (!token && req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string };
      req.userId = decoded.userId;
      req.userEmail = decoded.email;
    } catch {
      // Ignore invalid token for optional routes
    }
  }
  next();
};
