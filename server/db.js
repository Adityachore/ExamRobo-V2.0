import pg from 'pg';

export const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  // 50 students plus the admin dashboard share one API process. The pg default
  // is 10, which queues heartbeats behind answer writes; 20 keeps the pool well
  // under the default Postgres limit while leaving headroom for bursts.
  max: Number(process.env.PG_POOL_MAX || 20),
  idleTimeoutMillis: Number(process.env.PG_IDLE_TIMEOUT_MS || 30000),
  connectionTimeoutMillis: Number(process.env.PG_CONNECT_TIMEOUT_MS || 5000),
});

export const q = (...args) => pool.query(...args);

export async function withTransaction(fn) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    try {
      await client.query('ROLLBACK');
    } catch {
      /* the connection is already broken */
    }
    throw err;
  } finally {
    client.release();
  }
}
