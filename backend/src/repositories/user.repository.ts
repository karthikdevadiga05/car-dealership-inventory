import { pool } from '../db/pool';

export interface PublicUser {
  id: number;
  email: string;
  name: string | null;
  role: string;
  created_at: Date;
}

export interface UserRecord extends PublicUser {
  password_hash: string;
}

export async function createUser(
  email: string,
  passwordHash: string,
  name: string | null
): Promise<PublicUser> {
  const result = await pool.query(
    `INSERT INTO users (email, password_hash, name)
     VALUES ($1, $2, $3)
     RETURNING id, email, name, role, created_at`,
    [email, passwordHash, name]
  );
  return result.rows[0];
}

export async function findByEmail(
  email: string
): Promise<UserRecord | undefined> {
  const result = await pool.query(
    `SELECT id, email, name, password_hash, role, created_at
     FROM users WHERE email = $1`,
    [email]
  );
  return result.rows[0];
}