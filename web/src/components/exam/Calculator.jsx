import { useEffect, useReducer } from 'react';
import { Calculator as CalculatorIcon, X } from 'lucide-react';
import { cx } from '../ui.jsx';
import { initial, labelOf, press } from '../../lib/calculator.js';

const KEYS = [
  ['clear', 'C'], ['back', 'DEL'], ['sqrt', '√'], ['/', '÷'],
  ['7', '7'], ['8', '8'], ['9', '9'], ['*', '×'],
  ['4', '4'], ['5', '5'], ['6', '6'], ['-', '−'],
  ['1', '1'], ['2', '2'], ['3', '3'], ['+', '+'],
  ['0', '0'], ['.', '.'], ['=', '='], ['%', '%'],
];

const KEYBOARD = { Enter: '=', Escape: null, Backspace: 'back', '*': '*', '/': '/', '+': '+', '-': '-', '%': '%' };
const DIRECT = new Set(['=', '+', '-', '*', '/', '%', 'back']);

/** A client-only calculator. Nothing is sent to the server or persisted. */
export default function Calculator({ open, onClose }) {
  const [state, dispatch] = useReducer(press, initial);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') return onClose();
      const mapped = KEYBOARD[e.key] ?? e.key;
      if (mapped === null) return;
      if (/^\d$/.test(mapped) || mapped === '.' || DIRECT.has(mapped)) {
        e.preventDefault();
        dispatch(mapped);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <aside className="rounded-xl border border-line bg-white shadow-card" aria-label="Calculator" role="dialog">
      <div className="flex items-center justify-between border-b border-line px-3 py-2">
        <h2 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted">
          <CalculatorIcon size={13} aria-hidden />Calculator
        </h2>
        <button type="button" onClick={onClose} aria-label="Close calculator" className="rounded p-1 text-muted hover:bg-canvas hover:text-ink">
          <X size={14} aria-hidden />
        </button>
      </div>

      <output aria-live="polite" className={cx('tnum block truncate px-3 py-2.5 text-right text-2xl font-semibold', state.error ? 'text-danger' : 'text-ink')}>
        {labelOf(state)}
      </output>

      <div className="grid grid-cols-4 gap-1.5 p-2">
        {KEYS.map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => dispatch(key)}
            className={cx(
              'tnum grid h-10 place-items-center rounded-md border text-sm font-medium transition-colors',
              key === '=' ? 'border-primary bg-primary text-white hover:bg-primary/90'
                : key === 'clear' || key === 'back' ? 'border-line bg-canvas text-body hover:bg-line/60'
                : key === '+' || key === '-' || key === '*' || key === '/' || key === '%' || key === 'sqrt'
                  ? 'border-line bg-primary-soft text-primary hover:bg-primary-soft/70'
                  : 'border-line bg-white text-ink hover:bg-canvas',
            )}
          >
            {label}
          </button>
        ))}
      </div>
    </aside>
  );
}
