import request from 'supertest';
import app from '../src/app';
import { pool } from '../src/db/pool';
import { getToken } from './helpers/auth';
import { insertVehicle } from './helpers/vehicles';

const toyota = { make: 'Toyota', model: 'Camry', category: 'Sedan', price: 25000, quantity: 5 };
const ford = { make: 'Ford', model: 'F-150', category: 'Truck', price: 40000, quantity: 2 };

describe('vehicles API edge cases', () => {
  let userToken: string;
  let adminToken: string;

  beforeEach(async () => {
    await pool.query('TRUNCATE users, vehicles RESTART IDENTITY CASCADE');
    userToken = await getToken('user');
    adminToken = await getToken('admin');
  });

  afterAll(async () => {
    await pool.end();
  });

  it('search filters by category', async () => {
    await insertVehicle(toyota);
    await insertVehicle(ford);

    const response = await request(app)
      .get('/api/vehicles/search?category=truck')
      .set('Authorization', `Bearer ${userToken}`);

    expect(response.body).toHaveLength(1);
    expect(response.body[0].make).toBe('Ford');
  });

  it('search filters by model', async () => {
    await insertVehicle(toyota);
    await insertVehicle(ford);

    const response = await request(app)
      .get('/api/vehicles/search?model=camry')
      .set('Authorization', `Bearer ${userToken}`);

    expect(response.body).toHaveLength(1);
    expect(response.body[0].model).toBe('Camry');
  });

  it('search returns 400 for a non-numeric price', async () => {
    const response = await request(app)
      .get('/api/vehicles/search?minPrice=abc')
      .set('Authorization', `Bearer ${userToken}`);

    expect(response.status).toBe(400);
  });

  it('create returns 400 for a negative price', async () => {
    const response = await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ ...toyota, price: -5 });

    expect(response.status).toBe(400);
  });

  it('update returns 404 for an unknown vehicle', async () => {
    const response = await request(app)
      .put('/api/vehicles/9999')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ price: 1000 });

    expect(response.status).toBe(404);
  });

  it('update returns 400 for an empty body', async () => {
    const vehicle = await insertVehicle(toyota);

    const response = await request(app)
      .put(`/api/vehicles/${vehicle.id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({});

    expect(response.status).toBe(400);
  });

  it('delete returns 400 for a non-numeric id', async () => {
    const response = await request(app)
      .delete('/api/vehicles/abc')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(400);
  });

  it('purchase returns 404 for an unknown vehicle', async () => {
    const response = await request(app)
      .post('/api/vehicles/9999/purchase')
      .set('Authorization', `Bearer ${userToken}`);

    expect(response.status).toBe(404);
  });

  it('restock returns 400 for a zero quantity', async () => {
    const vehicle = await insertVehicle(toyota);

    const response = await request(app)
      .post(`/api/vehicles/${vehicle.id}/restock`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ quantity: 0 });

    expect(response.status).toBe(400);
  });
});