import { NextFunction, Request, Response } from 'express';
import { AppError } from '../errors/AppError';

/** Central error handler: turns AppError into JSON, hides everything else as 500. */
export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: err.message });
    return;
  }
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
}