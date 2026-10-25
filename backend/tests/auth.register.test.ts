import request from 'supertest';
import app from '../src/app';
import { pool } from '../src/db/pool';

describe('POST /api/auth/register', () => {
  beforeEach(async () => {
    await pool.query('TRUNCATE users RESTART IDENTITY CASCADE');
  });

  afterAll(async () => {
    await pool.end();
  });

  it('returns 201 and the user without a password', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({ email: 'a@test.com', password: 'secret123' });

    expect(response.status).toBe(201);
    expect(response.body.email).toBe('a@test.com');
    expect(response.body.password).toBeUndefined();
    expect(response.body.password_hash).toBeUndefined();
  });
});