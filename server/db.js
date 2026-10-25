import pg from 'pg';

export const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

export const q = (...args) => pool.query(...args);
