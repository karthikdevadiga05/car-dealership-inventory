import request from 'supertest';
import app from '../src/app';
import { pool } from '../src/db/pool';
import { getToken } from './helpers/auth';
import { insertVehicle } from './helpers/vehicles';

const toyota = {
  make: 'Toyota',
  model: 'Camry',
  category: 'Sedan',
  price: 25000,
  quantity: 5,
};
const ford = {
  make: 'Ford',
  model: 'F-150',
  category: 'Truck',
  price: 40000,
  quantity: 2,
};

describe('vehicles API', () => {
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

  it('GET /api/vehicles returns 401 without a token', async () => {
    const response = await request(app).get('/api/vehicles');

    expect(response.status).toBe(401);
  });

  it('POST /api/vehicles creates a vehicle', async () => {
    const response = await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(toyota);

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject(toyota);
    expect(response.body.id).toBeDefined();
  });

  it('POST /api/vehicles returns 400 when fields are missing', async () => {
    const response = await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ make: 'Toyota' });

    expect(response.status).toBe(400);
  });

  it('POST /api/vehicles returns 403 for a normal user', async () => {
    const response = await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${userToken}`)
      .send(toyota);

    expect(response.status).toBe(403);
  });

  it('GET /api/vehicles lists all vehicles', async () => {
    await insertVehicle(toyota);
    await insertVehicle(ford);

    const response = await request(app)
      .get('/api/vehicles')
      .set('Authorization', `Bearer ${userToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(2);
  });

  it('GET /api/vehicles/search filters by make', async () => {
    await insertVehicle(toyota);
    await insertVehicle(ford);

    const response = await request(app)
      .get('/api/vehicles/search?make=toy')
      .set('Authorization', `Bearer ${userToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].make).toBe('Toyota');
  });

  it('GET /api/vehicles/search filters by price range', async () => {
    await insertVehicle(toyota);
    await insertVehicle(ford);

    const response = await request(app)
      .get('/api/vehicles/search?minPrice=30000&maxPrice=50000')
      .set('Authorization', `Bearer ${userToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].make).toBe('Ford');
  });

  it('PUT /api/vehicles/:id updates a vehicle', async () => {
    const vehicle = await insertVehicle(toyota);

    const response = await request(app)
      .put(`/api/vehicles/${vehicle.id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ price: 27000 });

    expect(response.status).toBe(200);
    expect(response.body.price).toBe(27000);
    expect(response.body.make).toBe('Toyota');
  });

  it('PUT /api/vehicles/:id returns 403 for a normal user', async () => {
    const vehicle = await insertVehicle(toyota);

    const response = await request(app)
      .put(`/api/vehicles/${vehicle.id}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ price: 27000 });

    expect(response.status).toBe(403);
  });

  it('DELETE /api/vehicles/:id returns 403 for a normal user', async () => {
    const vehicle = await insertVehicle(toyota);

    const response = await request(app)
      .delete(`/api/vehicles/${vehicle.id}`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(response.status).toBe(403);
  });

  it('DELETE /api/vehicles/:id lets an admin delete', async () => {
    const vehicle = await insertVehicle(toyota);

    const response = await request(app)
      .delete(`/api/vehicles/${vehicle.id}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(204);
    const list = await request(app)
      .get('/api/vehicles')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(list.body).toHaveLength(0);
  });
});