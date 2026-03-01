import { Request, Response, NextFunction } from "express";

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error("Error:", err.message);

  if (err instanceof ValidationError) {
    return res.status(400).json({ error: err.message });
  }

  if (err.message.includes("PGRST")) {
    return res.status(400).json({ error: "Database error" });
  }

  return res.status(500).json({ error: "Internal server error" });
}

export function asyncHandler<T extends any[]>(
  fn: (...args: T) => Promise<any>
) {
  return (...args: T) => Promise.resolve(fn(...args)).catch(args[args.length - 1]);
}
