import { pool } from '../db/pool';

export interface Vehicle {
  id: number;
  make: string;
  model: string;
  category: string;
  price: number;
  quantity: number;
  imagePath: string | null;
}

export interface VehicleInput {
  make: string;
  model: string;
  category: string;
  price: number;
  quantity: number;
}

export interface SearchFilters {
  make?: string;
  model?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
}

const COLUMNS = `id, make, model, category, price::float8 AS price, quantity,
  CASE WHEN image_data IS NULL THEN NULL
       ELSE '/vehicles/' || id || '/image?v=' || (EXTRACT(EPOCH FROM image_updated_at))::bigint
  END AS "imagePath"`;

export async function insert(v: VehicleInput): Promise<Vehicle> {
  const result = await pool.query(
    `INSERT INTO vehicles (make, model, category, price, quantity)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING ${COLUMNS}`,
    [v.make, v.model, v.category, v.price, v.quantity]
  );
  return result.rows[0];
}

export async function findAll(): Promise<Vehicle[]> {
  const result = await pool.query(`SELECT ${COLUMNS} FROM vehicles ORDER BY id`);
  return result.rows;
}

export async function findById(id: number): Promise<Vehicle | undefined> {
  const result = await pool.query(
    `SELECT ${COLUMNS} FROM vehicles WHERE id = $1`,
    [id]
  );
  return result.rows[0];
}

/** Builds a parameterised WHERE clause from whichever filters were provided. */
export async function search(filters: SearchFilters): Promise<Vehicle[]> {
  const conditions: string[] = [];
  const values: unknown[] = [];
  const add = (sql: string, value: unknown) => {
    values.push(value);
    conditions.push(sql.replace('?', `$${values.length}`));
  };

  if (filters.make) add('make ILIKE ?', `%${filters.make}%`);
  if (filters.model) add('model ILIKE ?', `%${filters.model}%`);
  if (filters.category) add('category ILIKE ?', filters.category);
  if (filters.minPrice !== undefined) add('price >= ?', filters.minPrice);
  if (filters.maxPrice !== undefined) add('price <= ?', filters.maxPrice);

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const result = await pool.query(
    `SELECT ${COLUMNS} FROM vehicles ${where} ORDER BY id`,
    values
  );
  return result.rows;
}

/** Updates only the fields provided; missing fields keep their current value. */
export async function update(
  id: number,
  fields: Partial<VehicleInput>
): Promise<Vehicle | undefined> {
  const result = await pool.query(
    `UPDATE vehicles SET
       make = COALESCE($2, make),
       model = COALESCE($3, model),
       category = COALESCE($4, category),
       price = COALESCE($5, price),
       quantity = COALESCE($6, quantity)
     WHERE id = $1
     RETURNING ${COLUMNS}`,
    [
      id,
      fields.make ?? null,
      fields.model ?? null,
      fields.category ?? null,
      fields.price ?? null,
      fields.quantity ?? null,
    ]
  );
  return result.rows[0];
}

export async function remove(id: number): Promise<boolean> {
  const result = await pool.query('DELETE FROM vehicles WHERE id = $1', [id]);
  return (result.rowCount ?? 0) > 0;
}


/** Atomic: only decrements when enough stock remains, so concurrent buyers cannot oversell. */
export async function decrementStock(
  id: number,
  amount: number
): Promise<Vehicle | undefined> {
  const result = await pool.query(
    `UPDATE vehicles SET quantity = quantity - $2
     WHERE id = $1 AND quantity >= $2
     RETURNING ${COLUMNS}`,
    [id, amount]
  );
  return result.rows[0];
}

export async function incrementStock(
  id: number,
  amount: number
): Promise<Vehicle | undefined> {
  const result = await pool.query(
    `UPDATE vehicles SET quantity = quantity + $2
     WHERE id = $1
     RETURNING ${COLUMNS}`,
    [id, amount]
  );
  return result.rows[0];
}


export interface StoredImage {
  data: Buffer;
  type: string;
}

export async function saveImage(
  id: number,
  data: Buffer,
  type: string
): Promise<Vehicle | undefined> {
  const result = await pool.query(
    `UPDATE vehicles
     SET image_data = $2, image_type = $3, image_updated_at = NOW()
     WHERE id = $1
     RETURNING ${COLUMNS}`,
    [id, data, type]
  );
  return result.rows[0];
}

export async function clearImage(id: number): Promise<Vehicle | undefined> {
  const result = await pool.query(
    `UPDATE vehicles
     SET image_data = NULL, image_type = NULL, image_updated_at = NULL
     WHERE id = $1
     RETURNING ${COLUMNS}`,
    [id]
  );
  return result.rows[0];
}

export async function findImage(id: number): Promise<StoredImage | undefined> {
  const result = await pool.query(
    `SELECT image_data AS data, image_type AS type
     FROM vehicles WHERE id = $1 AND image_data IS NOT NULL`,
    [id]
  );
  return result.rows[0];
}