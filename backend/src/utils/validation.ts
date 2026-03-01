import { isAddress } from "ethers";

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validateWalletAddress(address: string): boolean {
  return isAddress(address);
}

export function validateInterval(days: number): boolean {
  return Number.isInteger(days) && days > 0 && days <= 365;
}

export function validatePercentage(
  percentage: number,
  decimals = 2
): boolean {
  const multiplier = Math.pow(10, decimals);
  return (
    Number.isFinite(percentage) && percentage > 0 && percentage <= 100 * multiplier
  );
}

export function sanitizeString(input: string, maxLength = 255): string {
  return input.trim().substring(0, maxLength);
}

export function sanitizeEmail(email: string): string {
  return sanitizeString(email).toLowerCase();
}
