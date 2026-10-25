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

// Minimal buffers that start with the real PNG / JPEG signatures.
const PNG = Buffer.concat([
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  Buffer.alloc(32, 1),
]);
const JPEG = Buffer.concat([Buffer.from([0xff, 0xd8, 0xff, 0xe0]), Buffer.alloc(32, 1)]);

describe('vehicle photos', () => {
  let userToken: string;
  let adminToken: string;
  let vehicleId: number;

  beforeEach(async () => {
    await pool.query('TRUNCATE users, vehicles RESTART IDENTITY CASCADE');
    userToken = await getToken('user');
    adminToken = await getToken('admin');
    vehicleId = (await insertVehicle(toyota)).id;
  });

  afterAll(async () => {
    await pool.end();
  });

  const upload = (
    token: string,
    id: number,
    file: Buffer,
    filename = 'car.png',
    contentType = 'image/png'
  ) =>
    request(app)
      .put(`/api/vehicles/${id}/image`)
      .set('Authorization', `Bearer ${token}`)
      .attach('image', file, { filename, contentType });

  it('a vehicle without a photo has a null imagePath', async () => {
    const response = await request(app)
      .get('/api/vehicles')
      .set('Authorization', `Bearer ${userToken}`);

    expect(response.body[0].imagePath).toBeNull();
  });

  it('an admin can upload a photo', async () => {
    const response = await upload(adminToken, vehicleId, PNG);

    expect(response.status).toBe(200);
    expect(response.body.imagePath).toMatch(/^\/vehicles\/\d+\/image\?v=\d+$/);
  });

  it('the photo can be fetched without a token', async () => {
    await upload(adminToken, vehicleId, PNG);

    const response = await request(app).get(`/api/vehicles/${vehicleId}/image`);

    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toBe('image/png');
    expect(Buffer.compare(response.body, PNG)).toBe(0);
  });

  it('fetching a photo that does not exist returns 404', async () => {
    const response = await request(app).get(`/api/vehicles/${vehicleId}/image`);

    expect(response.status).toBe(404);
    expect(response.body.error).toBe('Image not found');
  });

  it('uploading again replaces the existing photo', async () => {
    await upload(adminToken, vehicleId, PNG);
    await upload(adminToken, vehicleId, JPEG, 'car.jpg', 'image/jpeg');

    const response = await request(app).get(`/api/vehicles/${vehicleId}/image`);

    expect(response.headers['content-type']).toBe('image/jpeg');
  });

  it('rejects a file that is not really an image', async () => {
    const response = await upload(
      adminToken,
      vehicleId,
      Buffer.from('this is plain text'),
      'fake.png',
      'image/png'
    );

    expect(response.status).toBe(400);
  });

  it('rejects an upload with no file', async () => {
    const response = await request(app)
      .put(`/api/vehicles/${vehicleId}/image`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(400);
  });

  it('rejects a photo larger than 2 MB', async () => {
    const tooBig = Buffer.concat([PNG, Buffer.alloc(2 * 1024 * 1024)]);

    const response = await upload(adminToken, vehicleId, tooBig);

    expect(response.status).toBe(413);
  });

  it('a normal user cannot upload a photo', async () => {
    const response = await upload(userToken, vehicleId, PNG);

    expect(response.status).toBe(403);
  });

  it('uploading to an unknown vehicle returns 404', async () => {
    const response = await upload(adminToken, 9999, PNG);

    expect(response.status).toBe(404);
    expect(response.body.error).toBe('Vehicle not found');
  });

  it('an admin can remove a photo', async () => {
    await upload(adminToken, vehicleId, PNG);

    const removed = await request(app)
      .delete(`/api/vehicles/${vehicleId}/image`)
      .set('Authorization', `Bearer ${adminToken}`);
    const fetched = await request(app).get(`/api/vehicles/${vehicleId}/image`);

    expect(removed.status).toBe(200);
    expect(removed.body.imagePath).toBeNull();
    expect(fetched.status).toBe(404);
  });

  it('a normal user cannot remove a photo', async () => {
    const response = await request(app)
      .delete(`/api/vehicles/${vehicleId}/image`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(response.status).toBe(403);
  });

  it('the vehicle list exposes imagePath but never the raw image bytes', async () => {
    await upload(adminToken, vehicleId, PNG);

    const response = await request(app)
      .get('/api/vehicles')
      .set('Authorization', `Bearer ${userToken}`);

    expect(response.body[0].imagePath).toMatch(/\/image\?v=\d+$/);
    expect(response.body[0].image_data).toBeUndefined();
  });
});