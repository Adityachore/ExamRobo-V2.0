// ExamRobo load test (k6).
//
//   k6 run server/load/k6.js
//   BASE_URL=http://localhost:8080 VUS=100 DURATION=5m k6 run server/load/k6.js
//
// setup() creates a fresh event, uploads a roster for every VU and hands the
// roster to the VUs. Each VU signs in, takes the exam, answers every question
// and submits. Thresholds fail the run when latency or errors drift.
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Counter, Rate, Trend } from 'k6/metrics';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:4000';
const ADMIN_EMAIL = __ENV.ADMIN_EMAIL || 'admin@examrobo.dev';
const ADMIN_PASSWORD = __ENV.ADMIN_PASSWORD || 'admin123';
const VUS = Number(__ENV.VUS || 50);
const DURATION = __ENV.DURATION || '3m';
const THINK_TIME = Number(__ENV.THINK_TIME || 2);

const loginDuration = new Trend('login_duration', true);
const startDuration = new Trend('start_duration', true);
const questionDuration = new Trend('question_duration', true);
const answerDuration = new Trend('answer_duration', true);
const submitDuration = new Trend('submit_duration', true);
const loginErrors = new Counter('login_errors');
const examErrors = new Counter('exam_errors');
const answersRecorded = new Counter('answers_recorded');

// One log line per failure kind, not per request: a broken run must stay
// readable.
const logged = { login: 0, start: 0, question: 0, answer: 0, submit: 0, result: 0, submitted: 0 };
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
  },
  thresholds: {
    http_req_failed: ['rate<0.01'],
    login_duration: ['p(95)<2000'],
    start_duration: ['p(95)<3000'],
    question_duration: ['p(95)<1000'],
    answer_duration: ['p(95)<1000'],
    submit_duration: ['p(95)<3000'],
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

  // The event is already running: a VU that arrives before `starts_at` gets
  // 409 "not started" and would only pollute the error rate.
  const startsAt = new Date(Date.now() - 2000).toISOString();
  const eventRes = http.post(
    `${BASE_URL}/api/admin/events`,
    JSON.stringify({
      name: `k6 load run ${new Date().toISOString()}`,
      starts_at: startsAt,
      duration_min: 120,
      config: { Aptitude: 2, Logic: 2, Frontend: 2 },
    }),
    jsonParams({ Authorization: `Bearer ${token}` }),
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
    jsonParams({ Authorization: `Bearer ${token}` }),
  );
  if (rosterRes.status !== 200) {
    throw new Error(`roster upload failed: ${rosterRes.status} ${rosterRes.body}`);
  }

  return { eventId, emails };
}

// Module state lives as long as the VU does: a student hands the exam in
// once, so the VU stops asking for a new paper (and stops burning the login
// rate limit) after its first successful submission.
const completed = new Set();

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
    logOnce('submitted', `${email} -> already submitted`);
    return;
  }
  if (state.status !== 'active') {
    examErrors.add(1);
    logOnce('start', `${email} -> status ${state.status}`);
    return;
  }

  const sections = (state.paper && state.paper.sections) || [];
  const questions = [];
  for (const section of sections) {
    for (const question of section.questions || []) {
      questions.push(question);
    }
  }

  for (let i = 0; i < questions.length; i++) {
    const question = questions[i];
    // The start payload is a manifest; the stem and options arrive one
    // question at a time.
    const questionRes = http.get(`${BASE_URL}/api/exam/question/${i}`, { headers: auth });
    questionDuration.add(questionRes.timings.duration);
    let questionId = question.id;
    if (check(questionRes, { 'question 200': (r) => r.status === 200 })) {
      questionId = questionRes.json('question.id') || questionId;
    } else {
      examErrors.add(1);
      logOnce('question', `${email} -> ${questionRes.status} ${String(questionRes.body).slice(0, 200)}`);
    }
    const choice = (questionId.charCodeAt(questionId.length - 1) + i) % 4;
    const answer = http.post(
      `${BASE_URL}/api/exam/answer`,
      JSON.stringify({ question_id: questionId, choice, index: i }),
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

  const submit = http.post(`${BASE_URL}/api/exam/submit`, JSON.stringify({}), jsonParams(auth));
  submitDuration.add(submit.timings.duration);
  if (!check(submit, { 'submit 200': (r) => r.status === 200 })) {
    logOnce('submit', `${email} -> ${submit.status} ${String(submit.body).slice(0, 200)}`);
  } else {
    completed.add(email);
  }

  // k6's http.get takes (url, params) - a third argument is dropped, so the
  // Authorization header has to travel in the second one.
  const result = http.get(`${BASE_URL}/api/exam/result`, { headers: auth });
  if (!check(result, { 'result 200': (r) => r.status === 200 })) {
    logOnce('result', `${email} -> ${result.status} ${String(result.body).slice(0, 200)}`);
  }
}

export function teardown() {
  console.log(`k6 run finished: ${answersRecorded.count} answers recorded`);
}
