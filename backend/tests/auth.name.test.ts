import request from 'supertest';
import app from '../src/app';
import { pool } from '../src/db/pool';

const credentials = { email: 'a@test.com', password: 'secret123' };

describe('user name', () => {
  beforeEach(async () => {
    await pool.query('TRUNCATE users RESTART IDENTITY CASCADE');
  });

  afterAll(async () => {
    await pool.end();
  });

  it('register stores and returns the trimmed name', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({ ...credentials, name: '  Asha Rao ' });

    expect(response.status).toBe(201);
    expect(response.body.name).toBe('Asha Rao');
  });

  it('register still works without a name', async () => {
    const response = await request(app).post('/api/auth/register').send(credentials);

    expect(response.status).toBe(201);
    expect(response.body.name).toBeNull();
  });

  it('register returns 400 for a name longer than 60 characters', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({ ...credentials, name: 'x'.repeat(61) });

    expect(response.status).toBe(400);
  });

  it('me returns the email and name of the logged-in user', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({ ...credentials, name: 'Asha Rao' });
    const login = await request(app).post('/api/auth/login').send(credentials);

    const response = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${login.body.token}`);

    expect(response.body).toMatchObject({ email: 'a@test.com', name: 'Asha Rao' });
  });
});