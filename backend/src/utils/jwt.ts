import jwt from "jsonwebtoken";
import { env } from "./env.js";

export interface TokenPayload {
  userId: string;
  walletAddress: string;
  iat?: number;
  exp?: number;
}

export interface ClaimTokenPayload {
  vaultId: string;
  beneficiaryId: string;
  walletAddress: string;
  iat?: number;
  exp?: number;
}

export function generateToken(payload: Omit<TokenPayload, "iat" | "exp">) {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRY,
  });
}

export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, env.JWT_SECRET) as TokenPayload;
}

export function generateClaimToken(
  payload: Omit<ClaimTokenPayload, "iat" | "exp">,
  expirusIn = "7d"
) {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: expirusIn,
  });
}

export function verifyClaimToken(token: string): ClaimTokenPayload {
  return jwt.verify(token, env.JWT_SECRET) as ClaimTokenPayload;
}

export function decodeToken(token: string) {
  return jwt.decode(token);
}
