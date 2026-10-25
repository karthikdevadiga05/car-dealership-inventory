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

  it('returns 409 when the email is already registered', async () => {
    const credentials = { email: 'a@test.com', password: 'secret123' };
    await request(app).post('/api/auth/register').send(credentials);

    const response = await request(app)
      .post('/api/auth/register')
      .send(credentials);

    expect(response.status).toBe(409);
    expect(response.body.error).toBe('Email already registered');
  });

  it('returns 400 when the email is invalid', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({ email: 'not-an-email', password: 'secret123' });

    expect(response.status).toBe(400);
  });

  it('returns 400 when the password is shorter than 6 characters', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({ email: 'a@test.com', password: '123' });

    expect(response.status).toBe(400);
  });

  it('returns 400 when fields are missing', async () => {
    const response = await request(app).post('/api/auth/register').send({});

    expect(response.status).toBe(400);
  });
});