// A tiny four-function calculator. Pure state in, state out: the UI only
// renders it, and the tests can drive it without a DOM.
//
// `display` is what the student sees. `acc`/`op` hold a pending operation.
// `fresh` means the next digit starts a new number.

export const initial = { display: '0', acc: null, op: null, fresh: true, error: '' };

const OPERATORS = {
  '+': (a, b) => a + b,
  '-': (a, b) => a - b,
  '*': (a, b) => a * b,
  '/': (a, b) => a / b,
};

const MAX_DIGITS = 12;

function format(value) {
  if (!Number.isFinite(value)) return null;
  const rounded = Math.round(value * 1e10) / 1e10;
  const text = String(rounded);
  return text.length <= MAX_DIGITS ? text : String(Number(value.toPrecision(10)));
}

function startFresh(state) {
  return state.error ? { ...initial } : state;
}

export function press(state, key) {
  const s = startFresh(state);

  if (/^\d$/.test(key)) {
    if (s.fresh) return { ...s, display: key, fresh: false, error: '' };
    const next = s.display === '0' ? key : s.display + key;
    if (next.replace(/[-.]/g, '').length > MAX_DIGITS) return s;
    return { ...s, display: next, error: '' };
  }

  if (key === '.') {
    if (s.fresh) return { ...s, display: '0.', fresh: false, error: '' };
    return s.display.includes('.') ? s : { ...s, display: `${s.display}.`, error: '' };
  }

  if (key === 'clear') return { ...initial };

  if (key === 'back') {
    if (s.fresh || s.error) return { ...initial };
    const next = s.display.slice(0, -1);
    return { ...s, display: next === '' || next === '-' ? '0' : next, fresh: next === '' };
  }

  if (key === '%') {
    if (s.error) return s;
    const value = Number(s.display) / 100;
    const text = format(value);
    return text === null ? { ...s, error: 'Not a number' } : { ...s, display: text, fresh: true };
  }

  if (key === 'sqrt') {
    if (s.error) return s;
    const value = Number(s.display);
    if (value < 0) return { ...s, error: 'Not a number' };
    const text = format(Math.sqrt(value));
    return text === null ? { ...s, error: 'Not a number' } : { ...s, display: text, fresh: true };
  }

  if (key in OPERATORS) {
    if (s.error) return s;
    const value = Number(s.display);
    const acc = s.acc !== null && s.op && !s.fresh ? OPERATORS[s.op](s.acc, value) : value;
    const text = format(acc);
    if (text === null) return { ...s, error: 'Cannot divide by zero' };
    return { ...s, acc, op: key, display: text, fresh: true, error: '' };
  }

  if (key === '=') {
    if (s.error || s.op === null || s.acc === null) return s;
    const value = Number(s.display);
    if (s.op === '/' && value === 0) return { ...s, error: 'Cannot divide by zero' };
    const text = format(OPERATORS[s.op](s.acc, value));
    if (text === null) return { ...s, error: 'Not a number' };
    return { ...s, display: text, acc: null, op: null, fresh: true, error: '' };
  }

  return s;
}

// What the display should show: the error message wins, otherwise the number.
export function labelOf(state) {
  return state.error || state.display;
}
