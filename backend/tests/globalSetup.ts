import { runMigrations } from '../src/db/migrate';
import { pool } from '../src/db/pool';

export default async function globalSetup(): Promise<void> {
  await runMigrations();
  await pool.end();
}