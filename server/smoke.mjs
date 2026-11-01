// Smoke test against a running API (Postgres backed).
//
// Standalone:  node smoke.mjs            (needs an API on SMOKE_BASE)
// In-process:  await runSmoke({ base })  (boots the API itself, see scripts/verify.mjs)
//
// It seeds its own data first, so the assertions are deterministic.
import 'dotenv/config';
import WebSocket from 'ws';
import { pathToFileURL } from 'node:url';
import { pool } from './db.js';
import { seedDatabase } from './scripts/seed.js';
import { assertScratchDatabase } from './scripts/scratch-db.mjs';
import { SEB_HEADER, normalizeSebKey, sebHash } from './services/seb.js';

export async function runSmoke({ base = process.env.SMOKE_BASE || 'http://localhost:4000/api' } = {}) {
  // The seed truncates tables. This database has to be a disposable one.
  assertScratchDatabase(process.env.DATABASE_URL);

  const B = base.replace(/\/+$/, '');
  const WS = B.replace(/^http/, 'ws').replace(/\/api$/, '');
  const sebKey = normalizeSebKey(process.env.SEB_CONFIG_KEY);

  let pass = 0,
    fail = 0;
  const ok = (c, m) => {
    c ? pass++ : fail++;
    console.log(`${c ? 'PASS' : 'FAIL'} ${m}`);
  };
  const call = async (p, { m = 'GET', body, tok, raw } = {}) => {
    const r = await fetch(B + p, {
      method: m,
      headers: {
        ...(body && !raw ? { 'Content-Type': 'application/json' } : {}),
        ...(tok ? { Authorization: `Bearer ${tok}` } : {}),
        ...(sebKey && p.startsWith('/exam') ? { [SEB_HEADER]: sebHash(B + p, sebKey) } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    let j = null;
    try {
      j = await r.json();
    } catch {
      /* empty body */
    }
    return { s: r.status, j };
  };
  const login = async (email) => (await call('/auth/student', { m: 'POST', body: { email } })).j?.token;
  const wsTicket = async (tok) => (await call('/ws/ticket', { m: 'POST', tok })).j?.ticket;
  const connectWs = async (tok, tab = null) => {
    const ticket = await wsTicket(tok);
    const suffix = `?ticket=${encodeURIComponent(ticket || '')}${tab ? `&tab=${encodeURIComponent(tab)}` : ''}`;
    const socket = new WebSocket(`${WS}/ws${suffix}`);
    await new Promise((resolve, reject) => {
      socket.once('open', resolve);
      socket.once('error', reject);
    });
    return socket;
  };

  // Seed: event starts in 2s, 3 questions in each of 3 categories.
  const seeded = await seedDatabase({ offsetSec: 2 });
  const eventId = seeded.eventId;

  let r;
  // lockout: 3 bad attempts. The email is unique per run because the lockout
  // counter lives in Redis and outlives the process.
  const lockoutEmail = `nobody+${Date.now()}@x.com`;
  r = await call('/auth/student', { m: 'POST', body: { email: lockoutEmail } });
  ok(r.s === 403 && r.j.attemptsLeft === 2, 'bad email -> 403, 2 attempts left');
  await call('/auth/student', { m: 'POST', body: { email: lockoutEmail } });
  r = await call('/auth/student', { m: 'POST', body: { email: lockoutEmail } });
  ok(r.s === 429 && r.j.retryAfterSec === 900, '3rd failure -> 429 with 900s lock');
  r = await call('/auth/student', { m: 'POST', body: { email: lockoutEmail } });
  ok(r.s === 429, 'still locked');

  const adm = (
    await call('/auth/admin', { m: 'POST', body: { email: 'admin@examrobo.dev', password: 'admin123' } })
  ).j.token;
  r = await call('/auth/admin', { m: 'POST', body: { email: 'admin@examrobo.dev', password: 'bad' } });
  ok(r.s === 401, 'bad admin password -> 401');
  r = await call(`/admin/events/${eventId}/results`, { m: 'POST', tok: adm, body: { published: true } });
  ok(r.s === 400 && r.j.code === 'results_expiry_required', 'publishing results requires an expiry window');
  const stu = await login('student@example.com');
  ok(!!stu, 'eligible student signs in');
  r = await call('/admin/events', { tok: stu });
  ok(r.s === 401, 'student token rejected on admin route');
  r = await call('/student/event', { tok: adm });
  ok(r.s === 401, 'admin token rejected on student route');
  r = await call('/ws/ticket', { m: 'POST' });
  ok(r.s === 401, 'a WebSocket ticket needs a signed-in user');
  r = await call('/ws/ticket', { m: 'POST', tok: stu });
  ok(r.s === 200 && typeof r.j.ticket === 'string' && r.j.expires_in > 0, 'a WebSocket ticket is issued');

  r = await call('/admin/tickets', { tok: adm });
  ok(r.j.tickets.some((t) => t.source === 'lockout'), 'lockout created a ticket');

  await new Promise((res) => setTimeout(res, 2500)); // wait for event start
  if (process.env.SEB_REQUIRED === 'true') {
    r = await call('/seb/status');
    ok(r.s === 200 && r.j.required === true && r.j.configured === true, 'SEB is required and configured');
    const noSeb = await fetch(`${B}/exam/start`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${stu}` },
    });
    ok(noSeb.status === 403 && (await noSeb.json()).code === 'seb_required', 'an exam call without the SEB hash is refused');
  }
  r = await call('/exam/start', { m: 'POST', tok: stu });
  ok(r.s === 200 && r.j.status === 'active', 'exam starts');
  const hasKey = (o) =>
    o &&
    typeof o === 'object' &&
    (Object.keys(o).some((k) => /correct|answer_key|solution/i.test(k)) || Object.values(o).some(hasKey));
  ok(!hasKey(r.j.paper), 'paper has no answer-key field');
  const q0 = r.j.paper.sections[0].questions[0];
  const q1 = r.j.paper.sections[0].questions[1];
  ok(r.j.paper.sections.flatMap((s) => s.questions).length === 9, 'paper has 9 questions');
  ok(!('stem' in q0) && !('options' in q0), 'the manifest carries no stems or options');
  const endsAt = r.j.ends_at;
  r = await call('/exam/question/0', { tok: stu });
  ok(r.s === 200 && r.j.question.id === q0.id && typeof r.j.question.stem === 'string' && Array.isArray(r.j.question.options), 'one question is delivered on demand');
  r = await call('/exam/question/99', { tok: stu });
  ok(r.s === 400, 'an out-of-range question is rejected');
  await pool.query(
    `UPDATE papers SET last_seen_at = now() - interval '2 minutes'
      WHERE event_id = $1 AND email = 'student@example.com'`,
    [eventId],
  );
  r = await call('/exam/snapshot', { m: 'POST', tok: stu, body: { current_index: 0, fullscreen: true } });
  ok(r.s === 200 && r.j.warnings === 0, 'a connection gap is logged, not warned');
  const { rows: gapRows } = await pool.query(
    `SELECT count(*)::int AS n FROM proctor_events
      WHERE event_id = $1 AND kind = 'network_gap'`,
    [eventId],
  );
  ok(gapRows[0].n >= 1, 'the connection gap reaches the proctor log');
  r = await call('/exam/answer', { m: 'POST', tok: stu, body: { question_id: q0.id, choice: 1, index: 0 } });
  ok(r.s === 200, 'answer saved');
  ok(r.j.answered === 1, 'the first answer counts one');
  r = await call('/exam/answer', { m: 'POST', tok: stu, body: { question_id: q0.id, choice: 1, index: 0 } });
  ok(r.s === 200 && r.j.answered === 1, 'answering the same question again does not count twice');
  r = await call('/exam/answer', { m: 'POST', tok: stu, body: { question_id: q1.id, choice: 0, index: 1 } });
  ok(r.s === 200 && r.j.answered === 2, 'a second question counts two');
  r = await call('/exam/answer', { m: 'POST', tok: stu, body: { question_id: 999999, choice: 1 } });
  ok(r.s === 400, 'invalid question rejected');
  r = await call('/exam/start', { m: 'POST', tok: stu });
  ok(r.j.answers[q0.id] === 1 && r.j.ends_at === endsAt, 'rejoin restores answers and same deadline (no new attempt)');

  // Answer every question with the correct option (the admin bank is the only
  // place the key exists) and prove the server grades it as a full score.
  //
  // The paper is sectioned and only the active section accepts answers, so a
  // section is answered and then finished to unlock the next. The last section
  // is left open for the warning flow below, which submits the paper. The bank
  // gives the authored correct index; the answer endpoint expects the
  // *displayed* index, so map it through the paper's frozen option order.
  const bank = (await call('/bank/questions', { tok: adm })).j;
  const answerKey = new Map();
  for (const question of bank.questions || []) {
    for (const v of question.variants || []) answerKey.set(v.id, v.correct);
  }
  const paperSections = r.j.paper.sections;
  const paperQuestions = paperSections.flatMap((s) => s.questions);
  const { rows: orderRows } = await pool.query(
    `SELECT option_orders FROM papers WHERE event_id = $1 AND email = 'student@example.com'`,
    [eventId],
  );
  const optionOrders = orderRows[0]?.option_orders || [];
  let keyed = 0;
  let flat = 0;
  for (let s = 0; s < paperSections.length; s++) {
    for (const question of paperSections[s].questions) {
      const position = flat++;
      const correct = answerKey.get(question.id);
      if (correct === undefined) continue;
      const order = Array.isArray(optionOrders[position]) ? optionOrders[position] : null;
      const displayChoice = order ? order.indexOf(correct) : correct;
      if (displayChoice < 0) continue;
      const a = await call('/exam/answer', {
        m: 'POST',
        tok: stu,
        body: { question_id: question.id, choice: displayChoice, index: position },
      });
      if (a.s === 200) keyed++;
    }
    if (s < paperSections.length - 1) {
      await call('/exam/section/finish', {
        m: 'POST',
        tok: stu,
        body: { category: paperSections[s].name },
      });
    }
  }
  ok(keyed === 9, 'all 9 questions answered with the answer key');

  // warnings: the third warning submits, and the server enforces that.
  r = await call('/exam/event', { m: 'POST', tok: stu, body: { kind: 'tab_blur' } });
  ok(r.j.warnings === 1 && !r.j.submitted, 'warning 1');
  r = await call('/exam/event', { m: 'POST', tok: stu, body: { kind: 'fullscreen_exit' } });
  ok(r.j.warnings === 2 && !r.j.submitted, 'warning 2');
  r = await call('/exam/event', { m: 'POST', tok: stu, body: { kind: 'tab_blur' } });
  ok(r.j.warnings === 3 && r.j.submitted === true, 'warning 3 submits the exam');
  r = await call('/exam/answer', { m: 'POST', tok: stu, body: { question_id: q0.id, choice: answerKey.get(q0.id) } });
  ok(r.s === 409, 'answers are rejected after the warning limit');
  r = await call('/exam/submit', { m: 'POST', tok: stu });
  ok(r.s === 200, 'submitting an already submitted paper is idempotent');
  r = await call('/exam/start', { m: 'POST', tok: stu });
  ok(r.j.status === 'submitted' && r.j.submit_reason === 'max_warnings', 'restart reports the warning submission');
  r = await call('/exam/result', { tok: stu });
  ok(r.s === 409 && r.j.code === 'results_not_published', 'results stay hidden until an admin publishes them');
  const { rows: studentResultRows } = await pool.query(
    `SELECT submit_reason, result_snapshot FROM papers
      WHERE event_id = $1 AND email = 'student@example.com'`,
    [eventId],
  );
  const studentSnapshot = studentResultRows[0]?.result_snapshot || {};
  ok(
    studentResultRows[0]?.submit_reason === 'max_warnings' &&
      studentSnapshot.max === 9 && studentSnapshot.total === 9,
    'the warning submission was graded by the server (full score for the answer key)',
  );
  // The result says what the exam measured: the competency the paper froze.
  r = await call('/admin/results', { tok: adm });
  const studentRow = r.j.results.find((row) => row.email === 'student@example.com');
  const skillRows = studentRow?.competency?.skills || [];
  const difficultyRows = studentRow?.competency?.difficulties || [];
  ok(
    skillRows.reduce((a, s) => a + s.total, 0) === 9,
    'the result breaks the exam down by skill, and every question is counted',
  );
  ok(
    skillRows.reduce((a, s) => a + s.correct, 0) === 9,
    'a full score is a full score in every skill',
  );
  ok(
    difficultyRows.reduce((a, d) => a + d.total, 0) === 9,
    'the result breaks the exam down by difficulty',
  );
  ok(
    skillRows.every((s) => s.total >= s.answered && s.answered >= s.correct),
    'no skill claims more answers than it has questions',
  );
  ok(
    !JSON.stringify(studentRow?.competency || {}).includes('correct_idx'),
    'the result carries counts, never the answer key',
  );
  r = await call('/exam/feedback', { m: 'POST', tok: stu, body: { rating: 4, comment: 'ok' } });
  ok(r.s === 201, 'feedback saved');
  r = await call('/exam/feedback', { m: 'POST', tok: stu, body: { rating: 4 } });
  ok(r.s === 409, 'duplicate feedback rejected');

  // force submit + WS message
  const s2 = await login('john.doe@example.com');
  r = await call('/exam/start', { m: 'POST', tok: s2 });
  ok(r.j.status === 'active', 'second student starts');
  const got = [];
  const ws = await connectWs(s2);
  ws.on('message', (d) => got.push(JSON.parse(d)));
  const live = await call('/admin/live', { tok: adm });
  const key = live.j.sessions.find((s) => s.email === 'john.doe@example.com').key;
  r = await call('/admin/message', { m: 'POST', tok: adm, body: { key, message: 'Please focus.' } });
  ok(r.s === 200, 'message sent');
  r = await call('/admin/force-submit', { m: 'POST', tok: adm, body: { key } });
  ok(r.s === 200, 'force submit ok');
  await new Promise((res) => setTimeout(res, 300));
  ok(
    got.some((m) => m.type === 'message') && got.some((m) => m.type === 'submitted' && m.reason === 'force_submit'),
    'student WS got message + force-submit',
  );
  ws.close();
  r = await call('/exam/result', { tok: s2 });
  ok(r.s === 409 && r.j.code === 'results_not_published', 'a forced submission also waits for publication');

  /* ------------------------------------------------------- integrity policy */

  const roster = async (email, name) => {
    const res = await call(`/admin/events/${eventId}/roster`, { m: 'POST', tok: adm, body: { text: `${email}, ${name}` } });
    return res.j;
  };

  // Tier C: recorded, never penalised.
  await roster('integrity@example.com', 'Integrity Test');
  const s3 = await login('integrity@example.com');
  r = await call('/exam/start', { m: 'POST', tok: s3 });
  ok(r.j.status === 'active', 'integrity student starts');
  const s3q = r.j.paper.sections[0].questions[0];
  r = await call('/exam/event', { m: 'POST', tok: s3, body: { kind: 'devtools' } });
  ok(r.s === 200 && r.j.tier === 'log' && r.j.warnings === 0 && !r.j.submitted, 'a logged-only kind is not a warning');
  r = await call('/exam/event', { m: 'POST', tok: s3, body: { kind: 'nonsense' } });
  ok(r.s === 400, 'an unknown event kind is rejected');
  r = await call('/exam/event', { m: 'POST', tok: s3, body: { kind: 'second_session' } });
  ok(r.s === 400 && r.j.code === 'server_only_signal', 'concurrency signals cannot be reported by the client');
  r = await call('/exam/event', { m: 'POST', tok: s3, body: { kind: 'clipboard' } });
  ok(r.s === 200 && r.j.tier === 'warn' && r.j.warnings === 1 && !r.j.submitted, 'a blocked clipboard is a warning');

  // Capture attempts are warnings now, never an automatic ending.
  r = await call('/exam/event', { m: 'POST', tok: s3, body: { kind: 'screenshot_key' } });
  ok(r.s === 200 && r.j.warnings === 2 && !r.j.locked && !r.j.submitted, 'a screenshot key is a warning');
  r = await call('/exam/event', { m: 'POST', tok: s3, body: { kind: 'screenshot_key' } });
  ok(r.s === 200 && r.j.warnings === 3 && !r.j.locked && r.j.submitted, 'a third capture warning submits the exam');
  r = await call('/exam/answer', { m: 'POST', tok: s3, body: { question_id: s3q.id, choice: 1 } });
  ok(r.s === 409, 'the warning-limited exam no longer accepts answers');
  r = await call('/exam/submit', { m: 'POST', tok: s3 });
  ok(r.s === 200, 'a submitted paper can be handed in again');
  r = await call('/exam/result', { tok: s3 });
  ok(r.s === 409 && r.j.code === 'results_not_published', 'the warning submission is graded but hidden');

  // The fullscreen state travels in the heartbeat. The server keeps the last
  // state, so leaving fullscreen is one warning even when the client says so
  // twice, and staying out of fullscreen is not a second warning.
  await roster('fullscreen@example.com', 'Fullscreen Test');
  const sf = await login('fullscreen@example.com');
  r = await call('/exam/start', { m: 'POST', tok: sf });
  ok(r.j.status === 'active', 'fullscreen student starts');
  r = await call('/exam/snapshot', { m: 'POST', tok: sf, body: { current_index: 0, fullscreen: true } });
  ok(r.s === 200 && r.j.warnings === 0, 'a heartbeat in fullscreen is not a warning');
  r = await call('/exam/snapshot', { m: 'POST', tok: sf, body: { current_index: 0, fullscreen: false } });
  ok(r.s === 200 && r.j.warnings === 1, 'leaving fullscreen is one warning');
  r = await call('/exam/snapshot', { m: 'POST', tok: sf, body: { current_index: 0, fullscreen: false } });
  ok(r.s === 200 && r.j.warnings === 1, 'staying out of fullscreen is not a second warning');
  r = await call('/exam/snapshot', { m: 'POST', tok: sf, body: { current_index: 0, fullscreen: true } });
  ok(r.j.warnings === 1, 'going back to fullscreen is not a warning either');
  r = await call('/exam/snapshot', { m: 'POST', tok: sf, body: { current_index: 0, fullscreen: false } });
  ok(r.j.warnings === 1, 'a repeated exit inside the dedupe window is still one incident');

  // The server detects a second sign-in on its own.
  await roster('session@example.com', 'Session Test');
  const s4 = await login('session@example.com');
  r = await call('/exam/start', { m: 'POST', tok: s4 });
  ok(r.j.status === 'active', 'session student starts');
  const wsA = await connectWs(s4);
  const s5 = await login('session@example.com'); // a second sign-in: a new session id
  const wsB = await connectWs(s5);
  await new Promise((res) => setTimeout(res, 500));
  r = await call('/admin/live', { tok: adm });
  const sessionRow = r.j.sessions.find((s) => s.email === 'session@example.com');
  ok(
    !!sessionRow &&
      sessionRow.violation_kinds.includes('second_session') &&
      !sessionRow.violation_kinds.includes('second_window'),
    'the server detected the second session by itself, and counted it once',
  );
  wsA.close();
  wsB.close();

  // Two tabs of one sign-in are a second window, not a second device.
  await roster('tabs@example.com', 'Tabs Test');
  const t1 = await login('tabs@example.com');
  r = await call('/exam/start', { m: 'POST', tok: t1 });
  ok(r.j.status === 'active', 'tab student starts');
  const tabA = await connectWs(t1, 'tab-1');
  const tabB = await connectWs(t1, 'tab-2');
  await new Promise((res) => setTimeout(res, 500));
  r = await call('/admin/live', { tok: adm });
  const tabRow = r.j.sessions.find((s) => s.email === 'tabs@example.com');
  ok(
    !!tabRow &&
      tabRow.violation_kinds.includes('second_window') &&
      !tabRow.violation_kinds.includes('second_session'),
    'two tabs of one sign-in are a second window, not a second device',
  );
  tabA.close();
  tabB.close();

  // A reload re-uses the tab id: the stale socket is reaped and the reload
  // is not counted as a second window.
  await roster('reload@example.com', 'Reload Test');
  const rl = await login('reload@example.com');
  await call('/exam/start', { m: 'POST', tok: rl });
  const reloadA = await connectWs(rl, 'same-tab');
  const reloadB = await connectWs(rl, 'same-tab');
  await new Promise((res) => setTimeout(res, 500));
  r = await call('/admin/live', { tok: adm });
  const reloadRow = r.j.sessions.find((s) => s.email === 'reload@example.com');
  ok(
    !!reloadRow &&
      !reloadRow.violation_kinds.includes('second_window') &&
      !reloadRow.violation_kinds.includes('second_session'),
    'a reload of the same tab is not a second window',
  );
  reloadB.close();

  // The proctor can lock a session by hand.
  r = await call('/admin/live', { tok: adm });
  const lockKey = r.j.sessions.find((s) => s.email === 'session@example.com').key;
  r = await call('/admin/lock', { m: 'POST', tok: adm, body: { key: lockKey, reason: 'Locked by the proctor.' } });
  ok(r.s === 200, 'the proctor can lock a session');
  r = await call('/exam/result', { tok: s4 });
  ok(r.s === 409 && r.j.code === 'results_not_published', 'a manual lock ends the exam without revealing the score');
  const { rows: lockRows } = await pool.query(
    `SELECT submit_reason, lock_reason FROM papers WHERE event_id = $1 AND email = 'session@example.com'`,
    [eventId],
  );
  ok(
    lockRows[0]?.submit_reason === 'integrity_lockout' && !!lockRows[0]?.lock_reason,
    'a manual lock is recorded as an integrity lockout',
  );

  // admin data
  r = await call('/admin/results', { tok: adm });
  const ranked = r.j.results;
  ok(
    ranked.length === 4 &&
      ranked[0].rank === 1 &&
      ['student@example.com', 'john.doe@example.com', 'integrity@example.com', 'session@example.com'].every((e) =>
        ranked.some((x) => x.email === e),
      ),
    'leaderboard ranks every submitted paper',
  );
  const csv = await fetch(B + '/admin/results.csv', { headers: { Authorization: `Bearer ${adm}` } });
  ok(csv.status === 200 && (await csv.text()).startsWith('rank,'), 'CSV download from server');

  // The admin sees what the exam measured: per student and across the cohort.
  const analysed = ranked.find((x) => x.email === 'student@example.com');
  ok(
    analysed?.competency?.skills?.length > 0 &&
      analysed.competency.skills.reduce((a, s) => a + s.total, 0) === analysed.max,
    'the admin sees the competency of every student',
  );
  r = await call('/admin/analytics', { tok: adm });
  ok(
    r.s === 200 && r.j.students === 4 && r.j.analysed === 4,
    'the cohort analysis covers every submitted paper',
  );
  ok(
    r.j.skills.length > 0 &&
      r.j.skills.every((s) => s.total >= s.answered && s.answered >= s.correct && typeof s.accuracy === 'number'),
    'the cohort is broken down by skill',
  );
  ok(
    r.j.difficulties.length > 0 && r.j.difficulties.every((d) => d.label && d.level >= 1 && d.level <= 5),
    'the cohort is broken down by difficulty',
  );
  const cohortCsv = await fetch(B + '/admin/analytics.csv', { headers: { Authorization: `Bearer ${adm}` } });
  const cohortText = await cohortCsv.text();
  ok(
    cohortCsv.status === 200 &&
      cohortText.startsWith('dimension,key,label,category,total,answered,correct,accuracy') &&
      cohortText.includes('skill,') &&
      cohortText.includes('difficulty,'),
    'the competency breakdown exports as CSV',
  );
  r = await call(`/admin/events/${eventId}/roster`, {
    m: 'POST',
    tok: adm,
    body: { text: 'a@b.com, A B\nbad line\nstudent@example.com, Demo' },
  });
  ok(r.j.added === 1 && r.j.updated === 1 && r.j.invalid.length === 1, 'roster upsert summary');
  // A name that looks like a formula must stay text when the CSV is opened.
  r = await call(`/admin/events/${eventId}/roster`, {
    m: 'POST',
    tok: adm,
    body: { text: 'student@example.com, =1+1' },
  });
  const csv2 = await fetch(B + '/admin/results.csv', { headers: { Authorization: `Bearer ${adm}` } });
  const csvText = await csv2.text();
  ok(csvText.includes("'=1+1"), 'a formula-looking name is escaped in the CSV');
  r = await call('/bank/questions', { tok: adm });
  ok(Array.isArray(r.j.questions) && r.j.questions.length > 0, 'the bank lists questions');
  // A variant no exam uses can be deleted.
  r = await call('/bank/questions', {
    m: 'POST',
    tok: adm,
    body: { category: 'Logic', variant: { stem: 'Temporary', options: ['a', 'b', 'c', 'd'], correct: 1 } },
  });
  const tempVid = r.j.question.variants[0].id;
  r = await call(`/bank/variants/${tempVid}`, { m: 'DELETE', tok: adm });
  ok(r.s === 200, 'variant delete');
  // A variant an exam uses cannot: the paper froze its variant ids.
  r = await call(`/bank/variants/${paperQuestions[0].id}`, { m: 'DELETE', tok: adm });
  ok(r.s === 409, 'a variant used by an exam cannot be deleted');
  r = await call('/bank/questions', {
    m: 'POST',
    tok: adm,
    body: { category: 'Logic', variant: { stem: 'x', options: ['a', 'b', 'c', ''], correct: 1 } },
  });
  ok(r.s === 400, 'incomplete variant rejected');

  /* ----------------------------------------------------- competency (bank v2) */

  // The taxonomy and the difficulty scale are reference data: the client gets
  // them from the API instead of hard-coding them.
  r = await call('/bank/skills', { tok: adm });
  ok(r.s === 200 && r.j.skills.length > 0, 'the taxonomy is served to the client');
  ok(
    r.j.difficulties.length === 5 && r.j.difficulties[0].level === 1 && r.j.difficulties[4].level === 5,
    'the difficulty scale is served to the client',
  );
  const logical = r.j.skills.find((s) => s.code === 'logical_reasoning');
  ok(!!logical && logical.category === 'Logic' && logical.question_count > 0, 'a skill carries its category and a question count');

  // A skill is created with a code, a name and a category.
  const stamp = Date.now();
  const newCode = `smoke_skill_${stamp}`;
  r = await call('/bank/skills', { m: 'POST', tok: adm, body: { code: newCode, name: 'Smoke Skill', category: 'Logic' } });
  ok(r.s === 201 && r.j.skill.code === newCode, 'a skill can be added');
  r = await call('/bank/skills', { m: 'POST', tok: adm, body: { code: newCode, name: 'Smoke Skill', category: 'Logic' } });
  ok(r.s === 409, 'a duplicate skill code is rejected');
  // A code is normalised ("React Frontend" -> "react_frontend") and then
  // validated, so a code that cannot be a code is rejected with its reason.
  r = await call('/bank/skills', { m: 'POST', tok: adm, body: { code: '1st place', name: '', category: 'Nowhere' } });
  ok(r.s === 400 && r.j.fields.code && r.j.fields.name && r.j.fields.category, 'a bad skill is rejected with field errors');
  r = await call('/bank/skills', { m: 'POST', tok: adm, body: { code: 'Smoke Normalised Skill', name: 'Smoke Normalised Skill', category: 'Logic' } });
  ok(r.s === 201 && r.j.skill.code === 'smoke_normalised_skill', 'a skill code is normalised into a machine key');
  r = await call(`/bank/skills/${r.j.skill.id}`, { m: 'DELETE', tok: adm });
  ok(r.s === 200, 'an unused skill can be deleted');

  // A question is created with a skill and a difficulty.
  const variant = { stem: 'Competency check', options: ['a', 'b', 'c', 'd'], correct: 2 };
  r = await call('/bank/questions', {
    m: 'POST',
    tok: adm,
    body: { category: 'Logic', skill: 'logical_reasoning', difficulty: 4, variant },
  });
  ok(
    r.s === 201 && r.j.question.skill?.code === 'logical_reasoning' && r.j.question.difficulty === 4,
    'a question is created with a skill and a difficulty',
  );
  const taggedId = r.j.question.id;
  r = await call('/bank/questions', { m: 'POST', tok: adm, body: { category: 'Logic', skill: 'no_such_skill', variant } });
  ok(r.s === 400, 'an unknown skill is rejected');
  r = await call('/bank/questions', { m: 'POST', tok: adm, body: { category: 'Logic', difficulty: 9, variant } });
  ok(r.s === 400, 'a difficulty outside 1-5 is rejected');

  // The competency of a question is the only thing that can be changed.
  r = await call(`/bank/questions/${taggedId}/competency`, {
    m: 'POST',
    tok: adm,
    body: { skill: 'pattern_recognition', difficulty: 2 },
  });
  ok(
    r.s === 200 && r.j.question.skill.code === 'pattern_recognition' && r.j.question.difficulty === 2,
    'the competency of a question can be re-tagged',
  );
  r = await call(`/bank/questions/${taggedId}/competency`, { m: 'POST', tok: adm, body: { skill: null, difficulty: 3 } });
  ok(r.s === 200 && r.j.question.skill === null, 'a question can be untagged');
  r = await call(`/bank/questions/${taggedId}/competency`, { m: 'POST', tok: adm, body: { difficulty: 7 } });
  ok(r.s === 400, 'an invalid difficulty is rejected');
  r = await call('/bank/questions/00000000-0000-0000-0000-000000000000/competency', { m: 'POST', tok: adm, body: { difficulty: 3 } });
  ok(r.s === 404, 'an unknown question is a 404');

  // The filters.
  r = await call('/bank/questions?skill=logical_reasoning', { tok: adm });
  ok(
    r.s === 200 && r.j.questions.length > 0 && r.j.questions.every((x) => x.skill?.code === 'logical_reasoning'),
    'the questions can be filtered by skill',
  );
  r = await call('/bank/questions?difficulty=1', { tok: adm });
  ok(r.s === 200 && r.j.questions.every((x) => x.difficulty === 1), 'the questions can be filtered by difficulty');

  // A skill a question uses cannot be deleted: the question would lose the
  // competency it is measured against.
  r = await call('/bank/skills', { m: 'POST', tok: adm, body: { code: `used_skill_${stamp}`, name: 'Used Skill', category: 'Logic' } });
  const usedSkillId = r.j.skill.id;
  r = await call(`/bank/questions/${taggedId}/competency`, { m: 'POST', tok: adm, body: { skill: `used_skill_${stamp}` } });
  ok(r.s === 200, 'a question can be tagged with a new skill');
  r = await call(`/bank/skills/${usedSkillId}`, { m: 'DELETE', tok: adm });
  ok(r.s === 409 && r.j.in_use, 'a skill in use cannot be deleted');

  // A paper keeps its own copy of the competency. Re-tagging a question that
  // an exam already used must not rewrite that exam.
  const { rows: resultBeforeRows } = await pool.query(
    `SELECT result_snapshot FROM papers WHERE event_id = $1 AND email = 'student@example.com'`,
    [eventId],
  );
  const resultBefore = resultBeforeRows[0].result_snapshot;
  const { rows: frozen } = await pool.query(
    `SELECT pq.skill_code, pq.difficulty, v.question_id
       FROM paper_questions pq
       JOIN question_variants v ON v.id = pq.variant_id
      WHERE pq.paper_id = (SELECT id FROM papers WHERE email = 'student@example.com')
      LIMIT 1`,
  );
  ok(frozen.length === 1 && !!frozen[0].skill_code, 'the paper froze the competency of its questions');
  const before = frozen[0];
  await call(`/bank/questions/${before.question_id}/competency`, {
    m: 'POST',
    tok: adm,
    body: { skill: 'pattern_recognition', difficulty: 5 },
  });
  const { rows: after } = await pool.query(
    `SELECT pq.skill_code, pq.difficulty
       FROM paper_questions pq
       JOIN question_variants v ON v.id = pq.variant_id
      WHERE v.question_id = $1
        AND pq.paper_id = (SELECT id FROM papers WHERE email = 'student@example.com')
      LIMIT 1`,
    [before.question_id],
  );
  ok(
    after[0].skill_code === before.skill_code && after[0].difficulty === before.difficulty,
    're-tagging a question does not rewrite a paper that already used it',
  );
  // The same through the API: the result the student sees does not change
  // either. The seeded questions never reach difficulty 5, so a broken freeze
  // would show up as a new "Expert" row.
  const { rows: resultAfterRows } = await pool.query(
    `SELECT result_snapshot FROM papers WHERE event_id = $1 AND email = 'student@example.com'`,
    [eventId],
  );
  const resultAfter = resultAfterRows[0].result_snapshot;
  ok(
    JSON.stringify(resultAfter) === JSON.stringify(resultBefore),
    'the result of an exam does not change when a question is re-tagged',
  );
  const frozenLeaderboard = await call('/admin/results', { tok: adm });
  const frozenStudent = frozenLeaderboard.j.results.find((row) => row.email === 'student@example.com');
  ok(
    !frozenStudent.competency.difficulties.some((d) => d.level === 5),
    'the difficulty of the exam is the frozen one, not the new tag',
  );
  r = await call('/admin/flags', { m: 'POST', tok: adm, body: { kind: 'MISCONDUCT', email: 'x@y.com', reason: 'test' } });
  ok(r.s === 201, 'flag created');
  r = await call(`/admin/flags/${r.j.flag.id}`, { m: 'PATCH', tok: adm, body: { status: 'resolved' } });
  ok(r.j.flag.status === 'resolved', 'flag resolved');
  r = await call('/admin/events', { m: 'POST', tok: adm, body: { name: '', config: {} } });
  ok(r.s === 400 && r.j.fields.name, 'event validation returns field errors');

  /* ------------------------------------------------------- domain selection */

  // A domain-aware event: the student picks the technical domain in the
  // waiting room, before the timer starts.
  r = await call('/admin/events', {
    m: 'POST',
    tok: adm,
    body: {
      name: 'Domain Selection Run',
      starts_at: new Date(Date.now() - 1000).toISOString(),
      duration_min: 60,
      config: { Aptitude: 2, Logic: 2, Frontend: 2 },
      section_limits: { Aptitude: 5, Logic: 5, Frontend: 20 },
      domain_mode: 'select',
      domain_rules: { common: ['Aptitude', 'Logic'], allowed: ['Frontend'], min: 1, max: 1 },
    },
  });
  ok(r.s === 201, 'a domain-aware event is created');
  const domainEventId = r.j.event?.id;
  ok(r.j.event?.domain_mode === 'select', 'the event says the student picks a domain');

  r = await call('/admin/events', { m: 'POST', tok: adm, body: {
    name: 'Broken Domain Event',
    starts_at: new Date(Date.now() - 1000).toISOString(),
    duration_min: 60,
    config: { Aptitude: 2 },
    domain_mode: 'select',
    domain_rules: { common: ['Aptitude'], allowed: [], min: 1, max: 1 },
  } });
  ok(r.s === 400 && r.j.fields.domain_rules, 'an event without a selectable domain is refused');

  await call(`/admin/events/${domainEventId}/roster`, {
    m: 'POST',
    tok: adm,
    body: { text: 'domain@example.com, Domain Student' },
  });
  const sd = await login('domain@example.com');
  ok(!!sd, 'the domain student signs in');

  r = await call('/student/event', { tok: sd });
  ok(r.j.domains?.enabled === true, 'the waiting room is told the student picks a domain');
  ok(r.j.domains.common.length === 2, 'the waiting room is told the common part');
  ok(r.j.domains.allowed.length === 1 && r.j.domains.allowed[0].code === 'Frontend', 'the waiting room is told the selectable domains');
  ok(r.j.domains.allowed[0].count === 2, 'the waiting room is told what a domain is worth');

  r = await call('/exam/start', { m: 'POST', tok: sd });
  ok(r.s === 400 && r.j.code === 'domains_required', 'the exam refuses to start without a domain');
  const { rows: noPaper } = await pool.query(
    `SELECT count(*)::int AS n FROM papers WHERE email = 'domain@example.com'`,
  );
  ok(noPaper[0].n === 0, 'a refused selection leaves no paper behind');

  r = await call('/exam/start', { m: 'POST', tok: sd, body: { domains: ['Backend'] } });
  ok(r.s === 400 && r.j.code === 'unknown_domain', 'a domain that is not on offer is refused');

  r = await call('/exam/start', { m: 'POST', tok: sd, body: { domains: ['Frontend'] } });
  ok(r.s === 200 && r.j.status === 'active', 'the exam starts with a chosen domain');
  ok(
    r.j.paper.sections.flatMap((s) => s.questions).length === 6,
    'the paper holds the common questions and the chosen domain',
  );
  ok(
    r.j.paper.sections.map((s) => s.name).join(',') === 'Aptitude,Logic,Frontend',
    'the sections of the paper are its domains',
  );
  ok(
    Array.isArray(r.j.selected_domains) && r.j.selected_domains.join(',') === 'Frontend',
    'the chosen domain is frozen with the paper',
  );

  r = await call('/exam/start', { m: 'POST', tok: sd, body: { domains: ['Frontend'] } });
  ok(r.s === 200 && r.j.status === 'active', 'the resume returns the same paper');
  r = await call('/student/event', { tok: sd });
  ok(r.j.domains.selected.join(',') === 'Frontend', 'the waiting room shows the frozen choice');

  r = await call('/admin/events', { tok: adm });
  const listed = r.j.events.find((e) => e.id === domainEventId);
  ok(
    listed?.domain_mode === 'select' && listed?.domain_rules?.allowed?.[0] === 'Frontend',
    'the admin event view carries the domain rules',
  );

  // The paper keeps its own copy of the domain of every question: re-tagging
  // a question must not move the section of an exam that already ran.
  const { rows: frozenDomain } = await pool.query(
    `SELECT pq.category, v.question_id
       FROM paper_questions pq
       JOIN question_variants v ON v.id = pq.variant_id
      WHERE pq.paper_id = (SELECT id FROM papers WHERE email = 'domain@example.com')
        AND pq.category = 'Frontend'
      LIMIT 1`,
  );
  ok(frozenDomain.length === 1, 'the paper froze the domain of its questions');
  const movedQuestionId = frozenDomain[0].question_id;
  r = await call(`/bank/questions/${movedQuestionId}/competency`, {
    m: 'POST',
    tok: adm,
    body: { category: 'Logic' },
  });
  ok(r.s === 200 && r.j.question.category === 'Logic', 'a question can be moved to another domain');
  const { rows: stillFrozen } = await pool.query(
    `SELECT pq.category
       FROM paper_questions pq
       JOIN question_variants v ON v.id = pq.variant_id
      WHERE pq.paper_id = (SELECT id FROM papers WHERE email = 'domain@example.com')
        AND v.question_id = $1
      LIMIT 1`,
    [movedQuestionId],
  );
  ok(
    stillFrozen[0]?.category === 'Frontend',
    're-tagging a question does not move the section of a paper that already used it',
  );
  r = await call('/exam/start', { m: 'POST', tok: sd, body: { domains: ['Frontend'] } });
  ok(
    r.j.paper.sections.map((s) => s.name).join(',') === 'Aptitude,Logic,Frontend',
    'the sections a running paper shows do not move either',
  );

  /* --------------------------------------------------------- section timing */

  // Section limits start when the student opens a question in that section.
  // An expired section locks only itself; the rest of the paper stays live.
  r = await call('/admin/events', {
    m: 'POST',
    tok: adm,
    body: {
      name: 'Section Timing Run',
      starts_at: new Date(Date.now() - 1000).toISOString(),
      config: { Aptitude: 1, Logic: 1, Frontend: 1 },
      section_limits: { Aptitude: 5, Logic: 5, Frontend: 20 },
    },
  });
  ok(r.s === 201 && r.j.event?.duration_min === 30, 'an event derives its duration from its section limits');
  const sectionEventId = r.j.event.id;
  await call(`/admin/events/${sectionEventId}/roster`, {
    m: 'POST',
    tok: adm,
    body: { text: 'sections@example.com, Section Test' },
  });
  const ss = await login('sections@example.com');
  r = await call('/exam/start', { m: 'POST', tok: ss });
  ok(r.s === 200 && r.j.status === 'active', 'the section student starts');
  const sectionPaper = r.j.paper;
  const firstSection = sectionPaper.sections[0];
  const secondSection = sectionPaper.sections[1];
  const thirdSection = sectionPaper.sections[2];
  const secondQuestion = secondSection.questions[0];
  ok(
    (r.j.sections || []).length === 3 &&
      r.j.sections[0].state === 'active' &&
      r.j.sections[0].remaining_sec > 0 &&
      r.j.sections.slice(1).every((s) => s.state === 'locked' && s.started_at === null),
    'the first section starts with the paper and the rest stay locked',
  );

  const { rows: paperTiming } = await pool.query(
    `SELECT EXTRACT(EPOCH FROM (ends_at - started_at)) / 60 AS minutes
       FROM papers WHERE event_id = $1 AND email = 'sections@example.com'`,
    [sectionEventId],
  );
  ok(Math.round(Number(paperTiming[0].minutes)) === 30, 'the paper deadline uses its own section limits');

  r = await call('/exam/question/0', { tok: ss });
  ok(
    r.s === 200 && r.j.section?.category === firstSection.name && r.j.section.remaining_sec > 0,
    'the active section clock is reported with its question',
  );
  r = await call('/exam/answer', {
    m: 'POST',
    tok: ss,
    body: { question_id: thirdSection.questions[0].id, choice: 1 },
  });
  ok(r.s === 403 && r.j.code === 'section_locked', 'a future section refuses answers');
  await pool.query(
    `UPDATE paper_sections
        SET started_at = now() - interval '6 minutes',
            ends_at = now() - interval '1 minute'
      WHERE paper_id = (SELECT id FROM papers WHERE event_id = $1 AND email = 'sections@example.com')
        AND category = $2`,
    [sectionEventId, firstSection.name],
  );
  r = await call('/exam/answer', {
    m: 'POST',
    tok: ss,
    body: { question_id: firstSection.questions[0].id, choice: 1 },
  });
  ok(r.s === 409 && r.j.code === 'section_completed', 'a finished section refuses answers');
  r = await call('/exam/snapshot', { m: 'POST', tok: ss, body: { current_index: 0, fullscreen: true } });
  ok(
    r.s === 200 &&
      r.j.sections.some((s) => s.category === firstSection.name && s.locked && s.state === 'completed') &&
      r.j.sections.some((s) => s.category === secondSection.name && s.state === 'active'),
    'the expired section is completed and the next one is unlocked',
  );
  r = await call('/exam/answer', {
    m: 'POST',
    tok: ss,
    body: { question_id: secondQuestion.id, choice: 1 },
  });
  ok(r.s === 200, 'the next section accepts answers after one section expires');
  r = await call('/exam/start', { m: 'POST', tok: ss });
  ok(r.j.status === 'active', 'the overall paper stays active after a section expires');

  r = await call('/exam/section/finish', { m: 'POST', tok: ss, body: { category: secondSection.name } });
  ok(
    r.s === 200 && r.j.submitted === false && r.j.active_section === thirdSection.name,
    'finishing a section starts the next one',
  );
  r = await call('/exam/section/finish', { m: 'POST', tok: ss, body: { category: firstSection.name } });
  ok(r.s === 409 && r.j.code === 'section_not_active', 'a finished section cannot be finished again');
  r = await call('/exam/section/finish', { m: 'POST', tok: ss, body: { category: thirdSection.name } });
  ok(r.s === 200 && r.j.submitted === true && r.j.submit_reason === 'student', 'finishing the last section submits');
  const { rows: sectionResult } = await pool.query(
    `SELECT submit_reason FROM papers WHERE event_id = $1 AND email = 'sections@example.com'`,
    [sectionEventId],
  );
  ok(sectionResult[0]?.submit_reason === 'student', 'the last-section finish is stored as a student submission');

  /* ------------------------------------------------------- resume / restart */

  r = await call('/admin/events', {
    m: 'POST',
    tok: adm,
    body: {
      name: 'Resume Restart Run',
      starts_at: new Date(Date.now() - 1000).toISOString(),
      duration_min: 60,
      config: { Aptitude: 1, Logic: 1, Frontend: 1 },
      section_limits: { Aptitude: 20, Logic: 20, Frontend: 20 },
    },
  });
  ok(r.s === 201, 'an event for the resume and restart checks is created');
  const resumeEventId = r.j.event.id;
  await call(`/admin/events/${resumeEventId}/roster`, {
    m: 'POST',
    tok: adm,
    body: { text: 'resume@example.com, Resume Test' },
  });
  const sr = await login('resume@example.com');
  r = await call('/exam/start', { m: 'POST', tok: sr });
  const resumeQuestion = r.j?.paper?.sections?.[0]?.questions?.[0];
  ok(!!resumeQuestion, 'the resume student starts');
  if (!resumeQuestion) {
    throw new Error(`resume start failed: ${r.s} ${JSON.stringify(r.j)}`);
  }
  await call('/exam/answer', { m: 'POST', tok: sr, body: { question_id: resumeQuestion.id, choice: 1 } });
  const resumeKey = `${resumeEventId}:resume@example.com`;
  r = await call('/admin/force-submit', { m: 'POST', tok: adm, body: { key: resumeKey } });
  ok(r.s === 200, 'the proctor can force-submit an active paper');
  r = await call('/admin/resume', {
    m: 'POST',
    tok: adm,
    body: { key: resumeKey, minutes: 5, reason: 'Smoke resume' },
  });
  ok(r.s === 200 && r.j.session?.status === 'active', 'the admin can resume a force-submitted paper');
  r = await call('/exam/start', { m: 'POST', tok: sr });
  ok(
    r.j.status === 'active' && r.j.answers[resumeQuestion.id] === 1,
    'a resumed paper keeps its answers and section progress',
  );
  r = await call('/admin/force-submit', { m: 'POST', tok: adm, body: { key: resumeKey } });
  ok(r.s === 200, 'the resumed paper can be submitted again');

  r = await call('/admin/restart', {
    m: 'POST',
    tok: adm,
    body: { key: resumeKey, reason: 'Smoke restart' },
  });
  ok(r.s === 200 && r.j.session?.status === 'active', 'the admin can restart a submitted paper');
  r = await call('/exam/start', { m: 'POST', tok: sr });
  ok(
    r.j.status === 'active' && Object.keys(r.j.answers || {}).length === 0,
    'a restarted paper starts with no answers',
  );
  const { rows: restartState } = await pool.query(
    `SELECT p.id, p.attempt_no,
            (SELECT count(*)::int FROM paper_attempt_history h WHERE h.paper_id = p.id) AS history
       FROM papers p WHERE p.event_id = $1 AND p.email = 'resume@example.com'`,
    [resumeEventId],
  );
  ok(restartState[0].attempt_no === 2, 'a restart increments the attempt number');
  ok(restartState[0].history === 1, 'a restart keeps the previous attempt as history');

  // A forced submission after every section was finished must not make resume a
  // no-op. The last section is reopened with the extension, not submitted again.
  await pool.query(
    `UPDATE paper_sections
        SET started_at = now() - interval '1 minute',
            ends_at = now() + interval '1 minute',
            completed_at = now()
      WHERE paper_id = $1`,
    [restartState[0].id],
  );
  r = await call('/admin/force-submit', { m: 'POST', tok: adm, body: { key: resumeKey } });
  ok(r.s === 200, 'a paper with every section finished can be force-submitted');
  r = await call('/admin/resume', {
    m: 'POST',
    tok: adm,
    body: { key: resumeKey, minutes: 5, reason: 'Resume after every section finished' },
  });
  ok(r.s === 200 && r.j.session?.status === 'active', 'the admin can resume a fully finished paper');
  r = await call('/exam/start', { m: 'POST', tok: sr });
  const lastResumeSection = r.j?.paper?.sections?.[r.j.paper.sections.length - 1]?.name;
  ok(
    r.j.status === 'active' && !!lastResumeSection && r.j.active_section === lastResumeSection,
    'resume reopens the last completed section instead of submitting again',
  );

  r = await call(`/admin/events/${resumeEventId}/roster/${encodeURIComponent('resume@example.com')}`, {
    m: 'DELETE',
    tok: adm,
    body: { reason: 'Smoke removal' },
  });
  ok(r.s === 200 && r.j.submitted === true, 'removing an active student submits their current answers');
  r = await call('/student/event', { tok: sr });
  ok(r.s === 403 && r.j.code === 'removed', 'a removed student cannot reach the waiting room');
  r = await call('/exam/start', { m: 'POST', tok: sr });
  ok(r.s === 403 && r.j.code === 'removed', 'a removed student cannot start or resume a paper');
  r = await call('/exam/result', { tok: sr });
  ok(r.s === 403 && r.j.code === 'removed', 'a removed student cannot see an unpublished score');
  const { rows: removedResult } = await pool.query(
    `SELECT submit_reason FROM papers WHERE event_id = $1 AND email = 'resume@example.com'`,
    [resumeEventId],
  );
  ok(removedResult[0]?.submit_reason === 'removed', 'a removed student keeps their submitted attempt');
  r = await call(`/admin/events/${resumeEventId}/results`, {
    m: 'POST',
    tok: adm,
    body: { published: true, preset: '1h' },
  });
  ok(r.s === 200 && r.j.event.results_published === true, 'the removal event can publish results');
  r = await call('/exam/result', { tok: sr });
  ok(r.s === 403 && r.j.code === 'removed', 'a removed student cannot see a published score');
  r = await call('/admin/resume', {
    m: 'POST',
    tok: adm,
    body: { key: resumeKey, minutes: 5, reason: 'Should be refused' },
  });
  ok(r.s === 409 && r.j.code === 'student_removed', 'a removed student cannot be resumed');

  // A classic event has no domain selection at all.
  r = await call('/student/event', { tok: stu });
  ok(r.j.domains?.enabled === false, 'a classic event has no domain selection');

  // Publication waits for every existing paper. The integrity checks above leave
  // live papers behind, so the proctor hands them in the way an operator would.
  const { rows: livePapers } = await pool.query(
    `SELECT email FROM papers WHERE event_id = $1 AND status <> 'submitted'`,
    [eventId],
  );
  for (const livePaper of livePapers) {
    r = await call('/admin/force-submit', {
      m: 'POST',
      tok: adm,
      body: { key: `${eventId}:${livePaper.email}` },
    });
    ok(r.s === 200, `the proctor can hand in ${livePaper.email}'s live paper`);
  }

  /* ------------------------------------------------------- result publication */

  // Move the event's window into the past, then publish with an expiry. The
  // score becomes visible only after the manual publication is in effect.
  await pool.query(
    `UPDATE exam_events SET starts_at = now() - interval '61 minutes' WHERE id = $1`,
    [eventId],
  );
  r = await call('/exam/result', { tok: stu });
  ok(r.s === 409 && r.j.code === 'results_not_published', 'an ended event still hides unpublished results');
  r = await call(`/admin/events/${eventId}/results`, {
    m: 'POST',
    tok: adm,
    body: { published: true, preset: '1h' },
  });
  ok(r.s === 200 && r.j.event.results_published === true, 'an admin can publish results with an expiry');
  r = await call('/exam/result', { tok: stu });
  ok(
    r.s === 200 && r.j.max === 9 && r.j.submit_reason === 'max_warnings' && r.j.locked === false,
    'the published result is available to the student',
  );
  r = await call('/auth/student', { m: 'POST', body: { email: 'student@example.com' } });
  ok(r.s === 200 && !!r.j.token, 'a student can sign in after the event to view published results');
  r = await call(`/admin/events/${eventId}/results`, { m: 'POST', tok: adm, body: { published: false } });
  ok(r.s === 200 && r.j.event.results_published === false, 'publication can be reversed');
  r = await call('/exam/result', { tok: stu });
  ok(r.s === 409 && r.j.code === 'results_not_published', 'unpublishing hides the result again');

  console.log(`\n${pass} passed, ${fail} failed`);
  await clearLockout(lockoutEmail);
  return { pass, fail };

  // The lockout counter lives in Redis with a 15 minute TTL. Remove the key
  // this run created so the next run starts clean.
  async function clearLockout(email) {
    if (!process.env.REDIS_URL) return;
    try {
      const { default: Redis } = await import('ioredis');
      const redis = new Redis(process.env.REDIS_URL);
      const keys = await redis.keys(`examrobo:lockout:${email}|*`);
      if (keys.length) await redis.del(...keys);
      await redis.quit();
    } catch (err) {
      console.log(`(lockout cleanup skipped: ${err.message})`);
    }
  }
}

// Standalone entry point: the API is expected to be running already.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const { pool } = await import('./db.js');
  try {
    const { pass, fail } = await runSmoke();
    process.exit(fail ? 1 : 0);
  } catch (err) {
    console.error(err.message);
    process.exit(err.code === 'NOT_SCRATCH_DB' ? 2 : 1);
  } finally {
    await pool.end();
  }
}
