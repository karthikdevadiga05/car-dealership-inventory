import bcrypt from 'bcryptjs';
import { pool } from './pool';

const SAMPLE_VEHICLES = [
  ['Toyota', 'Camry', 'Sedan', 25000, 5],
  ['Honda', 'Civic', 'Sedan', 22000, 8],
  ['Ford', 'F-150', 'Truck', 40000, 3],
  ['Tesla', 'Model 3', 'Electric', 42000, 4],
  ['BMW', 'X5', 'SUV', 65000, 0],
  ['Hyundai', 'Creta', 'SUV', 18000, 6],
];

async function seed(): Promise<void> {
  const email = (process.env.ADMIN_EMAIL ?? 'admin@dealership.com').toLowerCase();
  const password = process.env.ADMIN_PASSWORD ?? 'admin123';
  const hash = await bcrypt.hash(password, 10);

  await pool.query(
    `INSERT INTO users (email, password_hash, role) VALUES ($1, $2, 'admin')
     ON CONFLICT (email) DO UPDATE SET role = 'admin', password_hash = EXCLUDED.password_hash`,
    [email, hash]
  );
  console.log(`Admin ready: ${email} / ${password}`);

  const { rows } = await pool.query('SELECT COUNT(*)::int AS count FROM vehicles');
  if (rows[0].count === 0) {
    for (const v of SAMPLE_VEHICLES) {
      await pool.query(
        'INSERT INTO vehicles (make, model, category, price, quantity) VALUES ($1, $2, $3, $4, $5)',
        v
      );
    }
    console.log(`Inserted ${SAMPLE_VEHICLES.length} sample vehicles`);
  }
}

seed()
  .catch((err) => console.error('Seed failed:', err))
  .finally(() => pool.end());