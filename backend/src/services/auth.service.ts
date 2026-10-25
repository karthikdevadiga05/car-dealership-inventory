import bcrypt from 'bcryptjs';
import { AppError } from '../errors/AppError';
import {
  createUser,
  findByEmail,
  PublicUser,
} from '../repositories/user.repository';

const SALT_ROUNDS = 10;
const MIN_PASSWORD_LENGTH = 6;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateCredentials(email: unknown, password: unknown): void {
  if (typeof email !== 'string' || !EMAIL_PATTERN.test(email.trim())) {
    throw new AppError(400, 'A valid email is required');
  }
  if (typeof password !== 'string' || password.length < MIN_PASSWORD_LENGTH) {
    throw new AppError(
      400,
      `Password must be at least ${MIN_PASSWORD_LENGTH} characters`
    );
  }
}

export async function registerUser(
  email: unknown,
  password: unknown
): Promise<PublicUser> {
  validateCredentials(email, password);

  const normalizedEmail = (email as string).trim().toLowerCase();
  if (await findByEmail(normalizedEmail)) {
    throw new AppError(409, 'Email already registered');
  }

  const passwordHash = await bcrypt.hash(password as string, SALT_ROUNDS);
  return createUser(normalizedEmail, passwordHash);
}