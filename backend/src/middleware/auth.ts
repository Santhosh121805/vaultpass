import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt.js";

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    walletAddress: string;
  };
}

export function authMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  try {
    const decoded = verifyToken(token);
    req.user = {
      userId: decoded.userId,
      walletAddress: decoded.walletAddress,
    };
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid token" });
  }
}

export function optionalAuthMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const token = req.headers.authorization?.split(" ")[1];

  if (token) {
    try {
      const decoded = verifyToken(token);
      req.user = {
        userId: decoded.userId,
        walletAddress: decoded.walletAddress,
      };
    } catch (error) {
      console.error("Token verification failed:", error);
    }
  }

  next();
}
