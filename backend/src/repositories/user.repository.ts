import { pool } from '../db/pool';

export interface PublicUser {
  id: number;
  email: string;
  role: string;
  created_at: Date;
}

export interface UserRecord extends PublicUser {
  password_hash: string;
}

export async function createUser(
  email: string,
  passwordHash: string
): Promise<PublicUser> {
  const result = await pool.query(
    `INSERT INTO users (email, password_hash)
     VALUES ($1, $2)
     RETURNING id, email, role, created_at`,
    [email, passwordHash]
  );
  return result.rows[0];
}

export async function findByEmail(
  email: string
): Promise<UserRecord | undefined> {
  const result = await pool.query(
    `SELECT id, email, password_hash, role, created_at
     FROM users WHERE email = $1`,
    [email]
  );
  return result.rows[0];
}