import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { pool, q } from '../db.js';

const email = String(process.argv[2] || process.env.ADMIN_EMAIL || '').trim().toLowerCase();
const password = String(process.env.ADMIN_PASSWORD || '');
const name = String(process.env.ADMIN_NAME || email.split('@')[0] || '').trim();
const emailRe = /^\S+@\S+\.\S+$/;

if (!emailRe.test(email)) {
  console.error('usage: ADMIN_PASSWORD=<secret> npm run create-admin -- admin@example.com');
  process.exit(1);
}
if (password.length < 12) {
  console.error('ADMIN_PASSWORD must be at least 12 characters.');
  process.exit(1);
}

try {
  const hash = await bcrypt.hash(password, Number(process.env.BCRYPT_ROUNDS || 12));
  const { rows } = await q(
    `INSERT INTO admins (email, password_hash, name)
     VALUES ($1, $2, $3)
     ON CONFLICT (email) DO UPDATE
       SET password_hash = EXCLUDED.password_hash,
           name = COALESCE(NULLIF(EXCLUDED.name, ''), admins.name)
     RETURNING id, email, name`,
    [email, hash, name],
  );
  console.log(`admin ready: ${rows[0].email}`);
} catch (err) {
  console.error('admin creation failed:', err.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}
