import { useEffect, useState } from 'react';
import { AnimatePresence, animate, motion, useMotionValue, useReducedMotion, useTransform } from 'motion/react';
import { cx } from './ui.jsx';

export const EASE = [0.22, 1, 0.36, 1];

/** Soft animated gradient backdrop. tone: blue | red | green */
export function Aurora({ tone = 'blue', grid = true, className }) {
  const c = { blue: ['#60a5fa', '#a5b4fc', '#7dd3fc'], red: ['#fca5a5', '#fdba74', '#fecdd3'], green: ['#86efac', '#6ee7b7', '#7dd3fc'] }[tone];
  return (
    <div aria-hidden className={cx('pointer-events-none absolute inset-0 -z-10 overflow-hidden bg-[#f6f9ff]', className)}>
      <div className="er-blob" style={{ width: 520, height: 520, left: '-8%', top: '-12%', background: c[0], animation: 'er-float 16s ease-in-out infinite' }} />
      <div className="er-blob" style={{ width: 460, height: 460, right: '-6%', top: '8%', background: c[1], animation: 'er-float2 19s ease-in-out infinite' }} />
      <div className="er-blob" style={{ width: 520, height: 520, left: '30%', bottom: '-22%', background: c[2], animation: 'er-float 22s ease-in-out infinite' }} />
      {grid && <div className="er-grid absolute inset-0" />}
    </div>
  );
}

/** Fade + rise on mount. `delay` in seconds. */
export function Reveal({ children, delay = 0, y = 16, className, as = 'div', ...p }) {
  const M = motion[as];
  return <M initial={{ opacity: 0, y }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay, ease: EASE }} className={className} {...p}>{children}</M>;
}

export const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } } };
export const rise = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } } };
export const Stagger = ({ children, className, ...p }) => <motion.div variants={stagger} initial="hidden" animate="show" className={className} {...p}>{children}</motion.div>;
export const Item = ({ children, className, as = 'div', ...p }) => { const M = motion[as]; return <M variants={rise} className={className} {...p}>{children}</M>; };

/** Number that counts up from 0. */
export function CountUp({ value, duration = 1.4, delay = 0.2, className }) {
  const reduce = useReducedMotion();
  const mv = useMotionValue(reduce ? value : 0);
  const out = useTransform(mv, (v) => Math.round(v));
  useEffect(() => {
    if (reduce) { mv.set(value); return; }
    const c = animate(mv, value, { duration, delay, ease: EASE });
    return () => c.stop();
  }, [value, duration, delay, reduce, mv]);
  return <motion.span className={className}>{out}</motion.span>;
}

/** One time unit of a flip-style countdown. */
export function FlipUnit({ value, label, danger }) {
  const text = String(Math.max(0, value)).padStart(2, '0');
  return (
    <div className="text-center">
      <div className={cx('er-glass tnum relative flex h-24 w-[4.5rem] items-center justify-center overflow-hidden rounded-2xl text-5xl font-semibold sm:h-28 sm:w-24 sm:text-6xl', danger ? 'text-danger' : 'text-ink')}>
        <div className="pointer-events-none absolute inset-x-0 top-1/2 h-px bg-slate-900/5" />
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span key={text} initial={{ y: -22, opacity: 0, filter: 'blur(4px)' }} animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }} exit={{ y: 22, opacity: 0, filter: 'blur(4px)' }} transition={{ duration: 0.35, ease: EASE }} className="block">{text}</motion.span>
        </AnimatePresence>
      </div>
      <div className="mt-2 text-xs font-medium uppercase tracking-wider text-muted">{label}</div>
    </div>
  );
}

/** Looping pulse dot. */
export function LiveDot({ tone = 'ok', className }) {
  const col = { ok: 'bg-ok', red: 'bg-danger', blue: 'bg-primary' }[tone];
  return <span className={cx('relative inline-flex h-2.5 w-2.5', className)} aria-hidden><span className={cx('er-ping absolute inset-0 rounded-full', col)} /><span className={cx('relative h-2.5 w-2.5 rounded-full', col)} /></span>;
}

/** Gradient primary button with press feedback. */
export function GlowButton({ children, loading, disabled, className, shine = true, ...p }) {
  return (
    <motion.button whileHover={disabled || loading ? undefined : { y: -1 }} whileTap={disabled || loading ? undefined : { scale: 0.98 }} disabled={disabled || loading}
      className={cx('er-btn-grad inline-flex h-11 items-center justify-center gap-2 rounded-xl px-5 font-medium text-white', shine && !disabled && !loading && 'er-shine', className)} {...p}>
      {children}
    </motion.button>
  );
}

/** Light confetti burst; renders nothing when reduced motion is on. */
export function Burst({ count = 26 }) {
  const reduce = useReducedMotion();
  const [parts] = useState(() => Array.from({ length: count }, (_, i) => ({ id: i, x: (Math.random() - 0.5) * 520, y: -(120 + Math.random() * 220), r: Math.random() * 540 - 270, c: ['#2563eb', '#38bdf8', '#16a34a', '#f59e0b', '#a78bfa'][i % 5], s: 6 + Math.random() * 6, d: Math.random() * 0.25 })));
  if (reduce) return null;
  return (
    <div aria-hidden className="pointer-events-none absolute left-1/2 top-24 z-10">
      {parts.map((p) => <motion.span key={p.id} className="absolute block rounded-[2px]" style={{ width: p.s, height: p.s * 0.6, background: p.c }}
        initial={{ x: 0, y: 0, opacity: 1, rotate: 0 }} animate={{ x: p.x, y: [0, p.y, p.y + 340], opacity: [1, 1, 0], rotate: p.r }} transition={{ duration: 1.9, delay: p.d, ease: 'easeOut' }} />)}
    </div>
  );
}

/** Decorative product preview (no real data): animated mini dashboard. */
export function ProductPreview({ className }) {
  return (
    <motion.div initial={{ opacity: 0, y: 30, rotateX: 8 }} animate={{ opacity: 1, y: 0, rotateX: 0 }} transition={{ duration: 0.9, delay: 0.35, ease: EASE }} style={{ perspective: 1000 }} className={cx('relative', className)} aria-hidden>
      <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }} className="er-glass rounded-2xl p-4">
        <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-red-300" /><span className="h-2 w-2 rounded-full bg-amber-300" /><span className="h-2 w-2 rounded-full bg-green-300" /><span className="ml-3 h-2 w-24 rounded bg-slate-200" /></div>
        <div className="mt-4 grid grid-cols-[64px_1fr] gap-3">
          <div className="space-y-2">{[0, 1, 2, 3, 4].map((i) => <div key={i} className={cx('h-5 rounded-md', i === 0 ? 'bg-primary/80' : 'bg-slate-200/80')} />)}</div>
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-2">{[0, 1, 2].map((i) => (<motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 + i * 0.12 }} className="rounded-lg border border-line bg-white/80 p-2"><div className="h-1.5 w-8 rounded bg-slate-200" /><div className="mt-2 h-3 w-10 rounded bg-slate-300" /></motion.div>))}</div>
            <div className="rounded-lg border border-line bg-white/80 p-2">
              <svg viewBox="0 0 200 60" className="h-16 w-full"><defs><linearGradient id="pv" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#2563eb" stopOpacity=".25" /><stop offset="1" stopColor="#2563eb" stopOpacity="0" /></linearGradient></defs>
                <motion.path d="M0 48 L25 40 L50 44 L80 28 L110 32 L140 16 L170 20 L200 6" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.8, delay: 1, ease: EASE }} />
                <motion.path d="M0 48 L25 40 L50 44 L80 28 L110 32 L140 16 L170 20 L200 6 L200 60 L0 60Z" fill="url(#pv)" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2 }} /></svg>
            </div>
          </div>
        </div>
      </motion.div>
      <motion.div animate={{ y: [0, 7, 0] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }} className="er-glass absolute -right-4 -top-5 flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium"><LiveDot /> Live proctoring</motion.div>
      <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut', delay: 1.2 }} className="er-glass absolute -bottom-4 -left-5 flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium"><span className="grid h-5 w-5 place-items-center rounded-full bg-ok-soft text-ok">✓</span> Answers saved</motion.div>
    </motion.div>
  );
}
