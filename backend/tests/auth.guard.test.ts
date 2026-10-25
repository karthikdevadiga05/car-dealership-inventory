import express from 'express';
import request from 'supertest';
import app from '../src/app';
import { pool } from '../src/db/pool';
import { errorHandler } from '../src/middleware/errorHandler';
import {
  authenticate,
  requireAdmin,
} from '../src/middleware/auth.middleware';

const credentials = { email: 'a@test.com', password: 'secret123' };

async function loginAndGetToken(): Promise<string> {
  const response = await request(app).post('/api/auth/login').send(credentials);
  return response.body.token;
}

// Small throwaway app so we can test requireAdmin before real vehicle routes exist.
const guardApp = express();
guardApp.get('/admin-only', authenticate, requireAdmin, (_req, res) => {
  res.json({ ok: true });
});
guardApp.use(errorHandler);

describe('authentication guard', () => {
  beforeEach(async () => {
    await pool.query('TRUNCATE users RESTART IDENTITY CASCADE');
    await request(app).post('/api/auth/register').send(credentials);
  });

  afterAll(async () => {
    await pool.end();
  });

  it('GET /api/auth/me returns 401 without a token', async () => {
    const response = await request(app).get('/api/auth/me');

    expect(response.status).toBe(401);
  });

  it('GET /api/auth/me returns 401 with an invalid token', async () => {
    const response = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer not.a.token');

    expect(response.status).toBe(401);
  });

  it('GET /api/auth/me returns the current user with a valid token', async () => {
    const token = await loginAndGetToken();

    const response = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.id).toBe(1);
    expect(response.body.role).toBe('user');
  });

  it('requireAdmin returns 403 for a normal user', async () => {
    const token = await loginAndGetToken();

    const response = await request(guardApp)
      .get('/admin-only')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(403);
  });

  it('requireAdmin allows an admin user', async () => {
    await pool.query("UPDATE users SET role = 'admin' WHERE email = $1", [
      credentials.email,
    ]);
    const token = await loginAndGetToken();

    const response = await request(guardApp)
      .get('/admin-only')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.ok).toBe(true);
  });
});