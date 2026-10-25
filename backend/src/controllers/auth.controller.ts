import { Request, Response } from 'express';
import { registerUser } from '../services/auth.service';

export async function register(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body;
  const user = await registerUser(email, password);
  res.status(201).json(user);
} 