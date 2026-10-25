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

describe('inventory API', () => {
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

  it('purchase decreases the quantity by one', async () => {
    const vehicle = await insertVehicle(toyota);

    const response = await request(app)
      .post(`/api/vehicles/${vehicle.id}/purchase`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(response.status).toBe(200);
    expect(response.body.quantity).toBe(4);
  });

  it('purchase fails when the vehicle is out of stock', async () => {
    const vehicle = await insertVehicle({ ...toyota, quantity: 0 });

    const response = await request(app)
      .post(`/api/vehicles/${vehicle.id}/purchase`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Vehicle is out of stock');
  });

  it('restock lets an admin increase the quantity', async () => {
    const vehicle = await insertVehicle(toyota);

    const response = await request(app)
      .post(`/api/vehicles/${vehicle.id}/restock`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ quantity: 10 });

    expect(response.status).toBe(200);
    expect(response.body.quantity).toBe(15);
  });

  it('restock returns 403 for a normal user', async () => {
    const vehicle = await insertVehicle(toyota);

    const response = await request(app)
      .post(`/api/vehicles/${vehicle.id}/restock`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ quantity: 10 });

    expect(response.status).toBe(403);
  });

    it('purchase returns 403 for an admin', async () => {
    const vehicle = await insertVehicle(toyota);

    const response = await request(app)
      .post(`/api/vehicles/${vehicle.id}/purchase`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(403);
  });

    it('purchase decreases the quantity by the requested amount', async () => {
    const vehicle = await insertVehicle(toyota);

    const response = await request(app)
      .post(`/api/vehicles/${vehicle.id}/purchase`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ quantity: 3 });

    expect(response.status).toBe(200);
    expect(response.body.quantity).toBe(2);
  });

  it('purchase fails when requesting more than the available stock', async () => {
    const vehicle = await insertVehicle(toyota);

    const response = await request(app)
      .post(`/api/vehicles/${vehicle.id}/purchase`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ quantity: 99 });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Not enough stock');
  });

  it.each([0, -1, 1.5, 'two'])(
    'purchase returns 400 for an invalid quantity (%p)',
    async (quantity) => {
      const vehicle = await insertVehicle(toyota);

      const response = await request(app)
        .post(`/api/vehicles/${vehicle.id}/purchase`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ quantity });

      expect(response.status).toBe(400);
    }
  );
});