import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { AppError } from '../errors/AppError';
import {
  createUser,
  findByEmail,
  PublicUser,
} from '../repositories/user.repository';

const SALT_ROUNDS = 10;
const MIN_PASSWORD_LENGTH = 6;
const MAX_NAME_LENGTH = 60;
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

/** The name is optional; when given it must be 1-60 characters after trimming. */
function parseName(name: unknown): string | null {
  if (name === undefined || name === null || name === '') return null;
  const trimmed = typeof name === 'string' ? name.trim() : '';
  if (!trimmed || trimmed.length > MAX_NAME_LENGTH) {
    throw new AppError(400, `Name must be 1-${MAX_NAME_LENGTH} characters`);
  }
  return trimmed;
}

export async function registerUser(
  email: unknown,
  password: unknown,
  name?: unknown
): Promise<PublicUser> {
  validateCredentials(email, password);
  const cleanName = parseName(name);

  const normalizedEmail = (email as string).trim().toLowerCase();
  if (await findByEmail(normalizedEmail)) {
    throw new AppError(409, 'Email already registered');
  }

  const passwordHash = await bcrypt.hash(password as string, SALT_ROUNDS);
  return createUser(normalizedEmail, passwordHash, cleanName);
}

export async function loginUser(
  email: unknown,
  password: unknown
): Promise<{ token: string }> {
  if (
    typeof email !== 'string' ||
    typeof password !== 'string' ||
    !email ||
    !password
  ) {
    throw new AppError(400, 'Email and password are required');
  }

  const user = await findByEmail(email.trim().toLowerCase());
  const passwordMatches =
    user !== undefined && (await bcrypt.compare(password, user.password_hash));

  if (!user || !passwordMatches) {
    throw new AppError(401, 'Invalid email or password');
  }

  const token = jwt.sign(
    { role: user.role, email: user.email, name: user.name },
    env.jwtSecret,
    { subject: String(user.id), expiresIn: '1d' }
  );
  return { token };
}