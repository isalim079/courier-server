import { Request, Response, NextFunction } from "express";

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export const roleMiddleware = (requiredRole: string) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    // Check if user role matches required role
    if (req.user!.role !== requiredRole) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Only ${requiredRole} can access this resource`,
      });
    }

    next();
  };
};
