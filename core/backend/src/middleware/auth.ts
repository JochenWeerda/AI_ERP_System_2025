import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import type { StringValue } from 'ms';
import { redis } from '../config/database';
import { logger } from '../utils/logger';

interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Kein Token vorhanden' });
    }

    // Überprüfe Token in der Blacklist (für ausgeloggte Tokens)
    const isBlacklisted = await redis.get(`bl_${token}`);
    if (isBlacklisted) {
      return res.status(401).json({ message: 'Token ist ungültig' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as {
      id: string;
      role: string;
    };

    req.user = decoded;
    return next();
  } catch (error) {
    logger.error('Authentication error:', error);
    return res.status(401).json({ message: 'Ungültiger Token' });
  }
};

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): Response | void => {
    if (!req.user) {
      return res.status(401).json({ message: 'Nicht authentifiziert' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: 'Keine Berechtigung für diese Aktion',
      });
    }

    return next();
  };
};

export interface TokenPayload {
  id: string;
  role: string;
  type?: string;
}

export const generateToken = (user: TokenPayload): string => {
  const options: jwt.SignOptions = {
    expiresIn: (process.env.JWT_EXPIRATION as StringValue | undefined) || '24h',
  };
  return jwt.sign(
    { id: user.id, role: user.role, type: user.type },
    process.env.JWT_SECRET || 'your-secret-key',
    options
  );
};

export const blacklistToken = async (token: string) => {
  try {
    const decoded = jwt.decode(token) as { exp: number } | null;
    if (decoded?.exp) {
      const ttl = decoded.exp * 1000 - Date.now();
      if (ttl > 0) {
        await redis.set(`bl_${token}`, '1', 'PX', ttl);
      }
    }
  } catch (error) {
    logger.error('Error blacklisting token:', error);
  }
}; 