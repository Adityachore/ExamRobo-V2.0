// Runs the k6 load test without hiding where k6 is needed. A missing binary is
// a setup problem, not a product failure: print the install hint and stop.
import { spawnSync } from 'node:child_process';

const probe = spawnSync('k6', ['version'], { encoding: 'utf8' });
if (probe.error?.code === 'ENOENT') {
  console.error('k6 is not installed. Install it from https://k6.io/docs/get-started/installation/ and run this command again.');
  process.exit(1);
}

const result = spawnSync('k6', ['run', 'load/k6.js', ...process.argv.slice(2)], {
  stdio: 'inherit',
  shell: false,
});
process.exit(result.status ?? 1);
