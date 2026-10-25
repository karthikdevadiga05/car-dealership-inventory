import request from 'supertest';
import app from '../src/app';
import { pool } from '../src/db/pool';

const credentials = { email: 'a@test.com', password: 'secret123' };

describe('POST /api/auth/login', () => {
  beforeEach(async () => {
    await pool.query('TRUNCATE users RESTART IDENTITY CASCADE');
    await request(app).post('/api/auth/register').send(credentials);
  });

  afterAll(async () => {
    await pool.end();
  });

  it('returns 200 and a JWT for valid credentials', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send(credentials);

    expect(response.status).toBe(200);
    expect(typeof response.body.token).toBe('string');
    expect(response.body.token.split('.')).toHaveLength(3);
  });

  it('returns 401 for a wrong password', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: credentials.email, password: 'wrong-password' });

    expect(response.status).toBe(401);
  });

  it('returns 401 for an unknown email', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nobody@test.com', password: 'secret123' });

    expect(response.status).toBe(401);
  });

  it('returns 400 when fields are missing', async () => {
    const response = await request(app).post('/api/auth/login').send({});

    expect(response.status).toBe(400);
  });
});