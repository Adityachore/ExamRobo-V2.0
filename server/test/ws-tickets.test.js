import test from 'node:test';
import assert from 'node:assert/strict';
import { clearWsTickets, consumeWsTicket, issueWsTicket } from '../services/ws-tickets.js';

test('a ticket is 48 hex characters and carries the payload', async () => {
  await clearWsTickets();
  const { ticket, expiresIn } = await issueWsTicket({ paperId: 'p1', role: 'student' });
  assert.match(ticket, /^[a-f0-9]{48}$/);
  assert.equal(expiresIn, 60);

  const record = await consumeWsTicket(ticket);
  assert.equal(record.paperId, 'p1');
  assert.equal(record.role, 'student');
});

test('a ticket is consumed exactly once', async () => {
  await clearWsTickets();
  const { ticket } = await issueWsTicket({ paperId: 'p1' });
  assert.ok(await consumeWsTicket(ticket));
  assert.equal(await consumeWsTicket(ticket), null);
});

test('two tickets are independent', async () => {
  await clearWsTickets();
  const first = await issueWsTicket({ paperId: 'p1' });
  const second = await issueWsTicket({ paperId: 'p2' });
  assert.notEqual(first.ticket, second.ticket);
  assert.equal((await consumeWsTicket(first.ticket)).paperId, 'p1');
  assert.equal((await consumeWsTicket(second.ticket)).paperId, 'p2');
});

test('an expired or malformed ticket is refused', async () => {
  await clearWsTickets();
  const { ticket } = await issueWsTicket({ paperId: 'p1' }, -1);
  assert.equal(await consumeWsTicket(ticket), null);
  assert.equal(await consumeWsTicket('nope'), null);
  assert.equal(await consumeWsTicket(null), null);
  assert.equal(await consumeWsTicket(''), null);
});

test('clearing drops the in-memory tickets', async () => {
  await clearWsTickets();
  const { ticket } = await issueWsTicket({ paperId: 'p1' });
  await clearWsTickets();
  assert.equal(await consumeWsTicket(ticket), null);
});
