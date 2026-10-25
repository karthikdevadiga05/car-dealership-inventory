import request from 'supertest';
import app from '../../src/app';
import { pool } from '../../src/db/pool';

/** Registers a user (promoting to admin if asked) and returns a login token. */
export async function getToken(role: 'user' | 'admin'): Promise<string> {
  const email = `${role}@test.com`;
  const password = 'secret123';

  await request(app).post('/api/auth/register').send({ email, password });
  if (role === 'admin') {
    await pool.query("UPDATE users SET role = 'admin' WHERE email = $1", [email]);
  }
  const response = await request(app)
    .post('/api/auth/login')
    .send({ email, password });
  return response.body.token;
}