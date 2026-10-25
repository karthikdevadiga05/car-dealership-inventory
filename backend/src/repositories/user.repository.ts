import { pool } from '../db/pool';

export interface PublicUser {
  id: number;
  email: string;
  role: string;
  created_at: Date;
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