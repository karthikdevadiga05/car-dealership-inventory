import { pool } from '../../src/db/pool';

interface VehicleSeed {
  make: string;
  model: string;
  category: string;
  price: number;
  quantity: number;
}

/** Inserts a vehicle straight into the DB and returns the created row. */
export async function insertVehicle(v: VehicleSeed) {
  const result = await pool.query(
    `INSERT INTO vehicles (make, model, category, price, quantity)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, make, model, category, price::float8 AS price, quantity`,
    [v.make, v.model, v.category, v.price, v.quantity]
  );
  return result.rows[0];
}