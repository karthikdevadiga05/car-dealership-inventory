import bcrypt from 'bcryptjs';
import { createUser, PublicUser } from '../repositories/user.repository';

const SALT_ROUNDS = 10;

export async function registerUser(
  email: string,
  password: string
): Promise<PublicUser> {
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  return createUser(email, passwordHash);
}