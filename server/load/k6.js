// ExamRobo load test (k6).
//
//   k6 run server/load/k6.js
//   BASE_URL=http://localhost:8080 VUS=50 DURATION=3m k6 run server/load/k6.js
//
// setup() creates a running event with section limits, uploads one roster row
// per VU, and hands the roster plus an admin token to the scenarios.
//
// Two scenarios run together:
//   students - sign in, take every section in order (finish between sections),
//              submit, read the result.
//   admins   - one operator polling the live dashboard and the event list, the
//              way the screen behaves during an exam.
//
// The API accepts one answer per global question index and only in the active
// section, so the script walks the manifest section by section instead of
// answering everything at once.
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Counter, Trend } from 'k6/metrics';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:4000';
const ADMIN_EMAIL = __ENV.ADMIN_EMAIL || 'admin@examrobo.dev';
const ADMIN_PASSWORD = __ENV.ADMIN_PASSWORD || 'admin123';
const VUS = Number(__ENV.VUS || 50);
const ADMINS = Number(__ENV.ADMINS || 1);
const DURATION = __ENV.DURATION || '3m';
const THINK_TIME = Number(__ENV.THINK_TIME || 2);
const QUESTIONS_PER_SECTION = Number(__ENV.QUESTIONS_PER_SECTION || 2);
const SECTION_MINUTES = Number(__ENV.SECTION_MINUTES || 30);
const CATEGORIES = ['Aptitude', 'Logic', 'Frontend'];

const loginDuration = new Trend('login_duration', true);
const startDuration = new Trend('start_duration', true);
const questionDuration = new Trend('question_duration', true);
const answerDuration = new Trend('answer_duration', true);
const sectionDuration = new Trend('section_duration', true);
const submitDuration = new Trend('submit_duration', true);
const adminLiveDuration = new Trend('admin_live_duration', true);
const loginErrors = new Counter('login_errors');
const examErrors = new Counter('exam_errors');
const answersRecorded = new Counter('answers_recorded');

// One log line per failure kind, not per request: a broken run must stay
// readable.
const logged = { login: 0, start: 0, question: 0, answer: 0, section: 0, submit: 0, result: 0, admin: 0 };
function logOnce(kind, message) {
  if (logged[kind] >= 3) return;
  logged[kind] += 1;
  console.log(`${kind} failure: ${message}`);
}

const jsonParams = (headers) => ({
  headers: { 'Content-Type': 'application/json', ...(headers || {}) },
});

export const options = {
  scenarios: {
    students: {
      executor: 'constant-vus',
      vus: VUS,
      duration: DURATION,
      exec: 'takeExam',
    },
    admins: {
      executor: 'constant-vus',
      vus: ADMINS,
      duration: DURATION,
      startTime: '5s',
      exec: 'watchAdmin',
    },
  },
  thresholds: {
    http_req_failed: ['rate<0.01'],
    login_duration: ['p(95)<2000'],
    start_duration: ['p(95)<3000'],
    question_duration: ['p(95)<1000'],
    answer_duration: ['p(95)<1000'],
    section_duration: ['p(95)<2000'],
    submit_duration: ['p(95)<3000'],
    admin_live_duration: ['p(95)<2000'],
  },
  discardResponseBodies: false,
};

export function setup() {
  const admin = http.post(
    `${BASE_URL}/api/auth/admin`,
    JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
    jsonParams(),
  );
  if (admin.status !== 200) {
    throw new Error(`admin login failed: ${admin.status} ${admin.body}`);
  }
  const token = admin.json('token');
  const auth = { Authorization: `Bearer ${token}` };

  // The event is already running: a VU that arrives before `starts_at` gets
  // 409 "not started" and would only pollute the error rate.
  const startsAt = new Date(Date.now() - 5000).toISOString();
  const config = {};
  const limits = {};
  for (const category of CATEGORIES) {
    config[category] = QUESTIONS_PER_SECTION;
    limits[category] = SECTION_MINUTES;
  }

  const eventRes = http.post(
    `${BASE_URL}/api/admin/events`,
    JSON.stringify({
      name: `k6 load run ${new Date().toISOString()}`,
      starts_at: startsAt,
      duration_min: SECTION_MINUTES * CATEGORIES.length,
      config,
      section_limits: limits,
      results_visibility: 'immediate',
    }),
    jsonParams(auth),
  );
  if (eventRes.status !== 201) {
    throw new Error(`event create failed: ${eventRes.status} ${eventRes.body}`);
  }
  const eventId = eventRes.json('event.id');

  const emails = [];
  const roster = [];
  // Every run uses its own student addresses: a student may take the exam
  // only once, and a reused address would land on the paper of the previous
  // run instead of on the event of this one.
  const runId = Date.now();
  for (let i = 1; i <= VUS; i++) {
    const email = `k6.vu${i}.${runId}@load.test`;
    emails.push(email);
    roster.push(`${email},Load Student ${i}`);
  }
  const rosterRes = http.post(
    `${BASE_URL}/api/admin/events/${eventId}/roster`,
    JSON.stringify({ text: roster.join('\n') }),
    jsonParams(auth),
  );
  if (rosterRes.status !== 201) {
    throw new Error(`roster upload failed: ${rosterRes.status} ${rosterRes.body}`);
  }

  return { eventId, emails, adminToken: token };
}

// Module state lives as long as the VU does: a student hands the exam in
// once, so the VU stops asking for a new paper (and stops burning the login
// rate limit) after its first successful submission.
const completed = new Set();

function manifestSections(state) {
  return (state.paper && state.paper.sections) || [];
}

function timingFor(state, name) {
  const list = state.sections || [];
  return list.find((section) => section.category === name) || null;
}

export function takeExam(data) {
  const email = data.emails[__VU - 1];
  if (!email) return;
  if (completed.has(email)) {
    sleep(5);
    return;
  }

  const login = http.post(`${BASE_URL}/api/auth/student`, JSON.stringify({ email }), jsonParams());
  loginDuration.add(login.timings.duration);
  const ok = check(login, { 'login 200': (r) => r.status === 200 });
  if (!ok) {
    loginErrors.add(1);
    logOnce('login', `${email} -> ${login.status} ${String(login.body).slice(0, 200)}`);
    sleep(1);
    return;
  }
  const token = login.json('token');
  const auth = { Authorization: `Bearer ${token}` };

  const start = http.post(`${BASE_URL}/api/exam/start`, JSON.stringify({}), jsonParams(auth));
  startDuration.add(start.timings.duration);
  if (!check(start, { 'start 200': (r) => r.status === 200 })) {
    examErrors.add(1);
    logOnce('start', `${email} -> ${start.status} ${String(start.body).slice(0, 200)}`);
    sleep(1);
    return;
  }
  const state = start.json();
  if (state.status === 'submitted') {
    // The student already handed in this exam - normal, not an error.
    completed.add(email);
    return;
  }
  if (state.status !== 'active') {
    examErrors.add(1);
    logOnce('start', `${email} -> status ${state.status}`);
    return;
  }

  const sections = manifestSections(state);
  // Resume support: if this run picked up a paper that already has a section
  // running, skip the sections that are finished and start at the active one.
  let started = sections.some((section) => timingFor(state, section.name)?.state === 'active');
  for (const section of sections) {
    const timing = timingFor(state, section.name);
    if (!started) {
      if (timing?.state !== 'active') continue;
      started = true;
    }
    if (timing?.state === 'completed') continue;

    for (const question of section.questions || []) {
      // The start payload is a manifest; the stem and options arrive one
      // question at a time.
      const questionRes = http.get(`${BASE_URL}/api/exam/question/${question.n}`, { headers: auth });
      questionDuration.add(questionRes.timings.duration);
      let questionId = question.id;
      if (check(questionRes, { 'question 200': (r) => r.status === 200 })) {
        questionId = questionRes.json('question.id') || questionId;
      } else {
        examErrors.add(1);
        logOnce('question', `${email} -> ${questionRes.status} ${String(questionRes.body).slice(0, 200)}`);
      }
      const answer = http.post(
        `${BASE_URL}/api/exam/answer`,
        JSON.stringify({ question_id: questionId, choice: (question.n + 1) % 4, index: question.n }),
        jsonParams(auth),
      );
      answerDuration.add(answer.timings.duration);
      if (check(answer, { 'answer 200': (r) => r.status === 200 })) {
        answersRecorded.add(1);
      } else {
        examErrors.add(1);
        logOnce('answer', `${email} -> ${answer.status} ${String(answer.body).slice(0, 200)}`);
      }
      sleep(THINK_TIME);
    }

    // Hand the section in so the next one starts. The last one submits.
    const finish = http.post(
      `${BASE_URL}/api/exam/section/finish`,
      JSON.stringify({ category: section.name }),
      jsonParams(auth),
    );
    sectionDuration.add(finish.timings.duration);
    if (!check(finish, { 'section finish 200': (r) => r.status === 200 })) {
      examErrors.add(1);
      logOnce('section', `${email} -> ${finish.status} ${String(finish.body).slice(0, 200)}`);
      return;
    }
    if (finish.json('submitted')) break;
  }

  const result = http.get(`${BASE_URL}/api/exam/result`, { headers: auth });
  submitDuration.add(result.timings.duration);
  if (check(result, { 'result 200': (r) => r.status === 200 })) {
    completed.add(email);
  } else {
    examErrors.add(1);
    logOnce('result', `${email} -> ${result.status} ${String(result.body).slice(0, 200)}`);
  }
}

export function watchAdmin(data) {
  const auth = { Authorization: `Bearer ${data.adminToken}` };
  const live = http.get(
    `${BASE_URL}/api/admin/live?event_id=${data.eventId}&limit=50`,
    { headers: auth },
  );
  adminLiveDuration.add(live.timings.duration);
  if (!check(live, { 'admin live 200': (r) => r.status === 200 })) {
    logOnce('admin', `live -> ${live.status} ${String(live.body).slice(0, 200)}`);
  }
  const events = http.get(`${BASE_URL}/api/admin/events`, { headers: auth });
  if (!check(events, { 'admin events 200': (r) => r.status === 200 })) {
    logOnce('admin', `events -> ${events.status} ${String(events.body).slice(0, 200)}`);
  }
  sleep(5);
}

export function teardown(data) {
  console.log(`k6 run finished: ${answersRecorded.count} answers recorded for event ${data?.eventId || '?'}`);
}
