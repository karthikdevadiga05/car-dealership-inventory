import request from 'supertest';
import app from '../src/app';
import { pool } from '../src/db/pool';

describe('password storage', () => {
  beforeEach(async () => {
    await pool.query('TRUNCATE users RESTART IDENTITY CASCADE');
  });

  afterAll(async () => {
    await pool.end();
  });

  it('stores the password hashed, never in plain text', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({ email: 'a@test.com', password: 'secret123' });

    const { rows } = await pool.query(
      'SELECT password_hash FROM users WHERE email = $1',
      ['a@test.com']
    );

    expect(rows[0].password_hash).not.toBe('secret123');
    expect(rows[0].password_hash.startsWith('$2')).toBe(true);
  });
});