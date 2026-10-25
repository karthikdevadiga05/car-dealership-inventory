import { NextFunction, Request, Response } from 'express';
import multer from 'multer';
import { AppError } from '../errors/AppError';

/** Central error handler: turns known errors into JSON, hides everything else as 500. */
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
  if (err instanceof multer.MulterError) {
    const tooBig = err.code === 'LIMIT_FILE_SIZE';
    res
      .status(tooBig ? 413 : 400)
      .json({ error: tooBig ? 'Image must be 2 MB or smaller' : err.message });
    return;
  }
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
}