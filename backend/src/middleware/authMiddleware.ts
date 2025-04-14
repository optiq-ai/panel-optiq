import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface UserPayload {
  id: number;
  username: string;
  groups: string[];
}

// Middleware to verify JWT token
export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN format
  
  if (!token) {
    return res.status(401).json({ message: 'Brak tokenu uwierzytelniającego' });
  }

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key') as UserPayload;
    (req as any).user = user;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Nieprawidłowy token' });
  }
};

// Middleware to check if user belongs to specified groups
export const authorizeGroups = (allowedGroups: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    
    if (!user || !user.groups) {
      return res.status(403).json({ message: 'Brak uprawnień' });
    }

    // Check if user has at least one of the allowed groups
    const hasPermission = user.groups.some((group: string) => 
      allowedGroups.includes(group)
    );

    if (!hasPermission) {
      return res.status(403).json({ message: 'Brak uprawnień do tego zasobu' });
    }

    next();
  };
};

// Middleware to check if user is admin (prezes)
export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  const user = (req as any).user;
  
  if (!user || !user.groups) {
    return res.status(403).json({ message: 'Brak uprawnień' });
  }

  // Check if user is in prezes group
  if (!user.groups.includes('prezes')) {
    return res.status(403).json({ message: 'Wymagane uprawnienia administratora' });
  }

  next();
};
