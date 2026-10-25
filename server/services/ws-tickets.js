import crypto from 'node:crypto';
import { getClient, isRedisReady } from './redis.js';

const PREFIX = 'examrobo:ws-ticket:';
const TICKET_RE = /^[a-f0-9]{48}$/;
const memory = new Map();
const DEFAULT_TTL_MS = 60_000;

function prune() {
  const now = Date.now();
  for (const [ticket, record] of memory) {
    if (record.exp <= now) memory.delete(ticket);
  }
}

export async function issueWsTicket(payload, ttlMs = DEFAULT_TTL_MS) {
  const ticket = crypto.randomBytes(24).toString('hex');
  const record = { ...payload, exp: Date.now() + ttlMs };

  if (isRedisReady()) {
    try {
      await getClient().set(`${PREFIX}${ticket}`, JSON.stringify(record), 'PX', ttlMs);
      return { ticket, expiresIn: Math.ceil(ttlMs / 1000) };
    } catch {
      // Fall back to this process; the WebSocket will still verify the ticket.
    }
  }

  memory.set(ticket, record);
  if (memory.size > 2000) prune();
  return { ticket, expiresIn: Math.ceil(ttlMs / 1000) };
}

export async function consumeWsTicket(ticket) {
  if (!TICKET_RE.test(String(ticket || ''))) return null;

  if (isRedisReady()) {
    try {
      const client = getClient();
      const raw = client.getdel
        ? await client.getdel(`${PREFIX}${ticket}`)
        : await client.eval(
            "local v = redis.call('GET', KEYS[1]); if v then redis.call('DEL', KEYS[1]) end; return v",
            1,
            `${PREFIX}${ticket}`,
          );
      if (raw) {
        const record = JSON.parse(raw);
        return record.exp > Date.now() ? record : null;
      }
      return null;
    } catch {
      // A Redis failure must not make a local ticket unusable.
    }
  }

  const record = memory.get(ticket);
  memory.delete(ticket);
  if (!record || record.exp <= Date.now()) return null;
  return record;
}

export async function clearWsTickets() {
  memory.clear();
  if (!isRedisReady()) return;
  try {
    const client = getClient();
    const keys = await client.keys(`${PREFIX}*`);
    if (keys.length) await client.del(...keys);
  } catch {
    // The in-memory store is already empty; Redis cleanup is best-effort.
  }
}
