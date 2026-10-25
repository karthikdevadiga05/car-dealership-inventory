import fs from 'fs';
import path from 'path';
import { pool } from './pool';

export async function runMigrations(): Promise<void> {
  const sql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8');
  await pool.query(sql);
}

if (require.main === module) {
  runMigrations()
    .then(() => console.log('Migration complete'))
    .catch((err) => console.error('Migration failed:', err))
    .finally(() => pool.end());
}