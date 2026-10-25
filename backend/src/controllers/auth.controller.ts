import { NextFunction, Request, Response } from 'express';
import { registerUser } from '../services/auth.service';

export async function register(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { email, password } = req.body ?? {};
    const user = await registerUser(email, password);
    res.status(201).json(user);
  } catch (err) {
    next(err);
  }
}