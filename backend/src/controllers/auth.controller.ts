import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/asyncHandler';
import { loginUser, registerUser } from '../services/auth.service';

export const register = asyncHandler(async (req, res) => {
  const { email, password } = req.body ?? {};
  res.status(201).json(await registerUser(email, password));
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body ?? {};
  res.status(200).json(await loginUser(email, password));
});

export function me(req: Request, res: Response): void {
  res.status(200).json(req.user);
}