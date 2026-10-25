import { Request, RequestHandler, Response } from 'express';

/** Wraps an async route handler so any thrown error reaches the error middleware. */
export const asyncHandler =
  (fn: (req: Request, res: Response) => Promise<void>): RequestHandler =>
  (req, res, next) => {
    fn(req, res).catch(next);
  };