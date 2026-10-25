// Bounded waiting helpers.
//
// The rule this file exists to enforce: a check either succeeds inside one
// deadline or it fails. There is no re-launch, no re-check loop and no
// unbounded wait. Every "is the service up?" question is asked once.
import { spawn } from 'node:child_process';

export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Polls `check` until it returns a truthy value or the deadline passes.
//
// `check` is expected to throw while the service is still coming up; the last
// error is carried on the timeout so the failure explains itself.
export async function waitFor(label, check, options = {}) {
  const { timeoutMs = 45_000, intervalMs = 2_000, onAttempt = null } = options;
  const deadline = Date.now() + timeoutMs;
  let attempts = 0;
  let lastError = null;

  while (Date.now() < deadline) {
    attempts += 1;
    try {
      const value = await check();
      if (value) return { value, attempts, waitedMs: timeoutMs - (deadline - Date.now()) };
      lastError = new Error('check did not report ready');
    } catch (err) {
      lastError = err;
    }
    if (onAttempt) onAttempt(attempts, lastError);
    await sleep(Math.min(intervalMs, Math.max(0, deadline - Date.now())));
  }

  const error = new Error(`Timed out after ${timeoutMs}ms waiting for ${label}`);
  error.attempts = attempts;
  error.lastError = lastError;
  error.cause = lastError;
  throw error;
}

// Rejects if the promise has not settled inside the deadline. Used to make
// sure a single verification phase can never wedge the run.
export function withTimeout(promise, label, timeoutMs = 120_000) {
  let timer = null;
  const guard = new Promise((_resolve, reject) => {
    timer = setTimeout(
      () => reject(new Error(`Timed out after ${timeoutMs}ms running ${label}`)),
      timeoutMs,
    );
  });
  return Promise.race([promise.finally(() => clearTimeout(timer)), guard]);
}

// Runs a child process with a hard deadline. The child is killed when the
// deadline passes, so a hung command can never hold up the rest of the run.
export function runProcess(command, args, options = {}) {
  const { timeoutMs = 120_000, cwd = process.cwd(), env = process.env, label = labelOf(command, args) } = options;

  return new Promise((resolve) => {
    const child = spawn(command, args, { cwd, env, shell: false, stdio: ['ignore', 'pipe', 'pipe'] });
    let stdout = '';
    let stderr = '';
    let timedOut = false;

    const timer = setTimeout(() => {
      timedOut = true;
      child.kill('SIGKILL');
    }, timeoutMs);

    child.stdout.on('data', (d) => {
      stdout += d.toString();
    });
    child.stderr.on('data', (d) => {
      stderr += d.toString();
    });

    child.on('error', (err) => {
      clearTimeout(timer);
      resolve({ ok: false, code: -1, stdout, stderr: `${stderr}${err.message}`, timedOut, label });
    });

    child.on('close', (code) => {
      clearTimeout(timer);
      resolve({ ok: code === 0 && !timedOut, code, stdout, stderr, timedOut, label });
    });
  });
}

function labelOf(command, args) {
  return [command, ...args].join(' ');
}
