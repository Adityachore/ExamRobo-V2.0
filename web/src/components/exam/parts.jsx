import { useCallback, useEffect, useRef, useState } from 'react';
import { BookOpenCheck, Check, CircleAlert, Clock, Maximize, ShieldCheck, TriangleAlert } from 'lucide-react';
import { Badge, Banner, Button, Drawer, Modal, Spinner, cx } from '../ui.jsx';
import { clock, splitHMS, pad } from '../../lib/format.js';

/* Countdown for the exam: red under 2 minutes, numeric value always shown. */
export function ExamTimer({ remainingSec }) {
  const low = remainingSec < 120;
  return (
    <div role="timer" aria-label={`Time remaining ${clock(remainingSec)}`} className={cx('tnum flex items-center gap-2 rounded-md border px-2.5 py-1.5', low ? 'border-red-200 bg-danger-soft text-danger-ink' : 'border-line bg-white text-ink')}>
      <Clock size={15} className={low ? '' : 'text-muted'} aria-hidden />
      <span className="leading-none">
        <span className="block text-[10px] font-medium uppercase tracking-wide opacity-70">Time left</span>
        <span aria-hidden className="mt-0.5 block text-[17px] font-semibold leading-none">{clock(remainingSec)}</span>
      </span>
      {low && <span className="hidden text-[10px] font-semibold sm:inline">Under 2 min</span>}
    </div>
  );
}

/**
 * The exam countdown. It owns its own one-second ticker, so the runner above
 * it does not re-render four times a second just to show a clock. The
 * deadline still comes from the server; the offset only anchors the display.
 */
export function ExamCountdown({ endsAt, serverTime, onExpire }) {
  const offset = useRef(0);
  const expireRef = useRef(onExpire);
  expireRef.current = onExpire;

  const compute = useCallback(() => {
    const server = Date.now() + offset.current;
    return Math.max(0, (Date.parse(endsAt) - server) / 1000);
  }, [endsAt]);

  const [remaining, setRemaining] = useState(compute);

  useEffect(() => {
    offset.current = serverTime ? Date.parse(serverTime) - Date.now() : 0;
    setRemaining(compute());
  }, [serverTime, compute]);

  useEffect(() => {
    const t = setInterval(() => {
      const left = compute();
      setRemaining(left);
      if (left <= 0) expireRef.current?.();
    }, 1000);
    return () => clearInterval(t);
  }, [compute]);

  return <ExamTimer remainingSec={remaining} />;
}

/**
 * The clock of the section the student is currently working in. It is anchored
 * to the server like the whole-paper clock, and it asks the runner to lock the
 * section when the displayed time reaches zero. The server remains the judge.
 */
export function SectionCountdown({ timing, serverTime, onExpire }) {
  const offset = useRef(0);
  const expireRef = useRef(onExpire);
  expireRef.current = onExpire;
  const fired = useRef(null);

  const compute = useCallback(() => {
    if (!timing?.ends_at) return null;
    const server = Date.now() + offset.current;
    return Math.max(0, (Date.parse(timing.ends_at) - server) / 1000);
  }, [timing?.ends_at]);

  const [remaining, setRemaining] = useState(compute);

  useEffect(() => {
    offset.current = serverTime ? Date.parse(serverTime) - Date.now() : 0;
    setRemaining(compute());
  }, [serverTime, compute]);

  useEffect(() => {
    if (!timing?.ends_at) {
      setRemaining(null);
      return;
    }
    const t = setInterval(() => setRemaining(compute()), 1000);
    return () => clearInterval(t);
  }, [compute, timing?.ends_at]);

  useEffect(() => {
    if (remaining === null || remaining > 0 || timing?.locked) return;
    if (fired.current === timing.ends_at) return;
    fired.current = timing.ends_at;
    expireRef.current?.();
  }, [remaining, timing?.ends_at, timing?.locked]);

  if (!timing?.ends_at) {
    return <Badge tone="neutral" icon={<Clock size={12} />}>Section not started</Badge>;
  }

  const ended = timing.locked || remaining <= 0;
  const low = !ended && remaining < 120;
  return (
    <div role={ended ? undefined : 'timer'} aria-label={ended ? 'Section time ended' : `Section time remaining ${clock(remaining ?? 0)}`}
      className={cx('tnum flex items-center gap-2 rounded-md border px-2.5 py-1.5', ended ? 'border-red-200 bg-danger-soft text-danger-ink' : low ? 'border-amber-200 bg-warn-soft text-warn-ink' : 'border-line bg-white text-ink')}>
      <Clock size={15} className={ended || low ? '' : 'text-muted'} aria-hidden />
      <span className="leading-none">
        <span className="block text-[10px] font-medium uppercase tracking-wide opacity-70">{ended ? 'Section ended' : 'Section left'}</span>
        <span aria-hidden className="mt-0.5 block text-[15px] font-semibold leading-none">{ended ? '00:00' : clock(remaining ?? 0)}</span>
      </span>
    </div>
  );
}

/**
 * The section strip above the question. It shows which section is open, what
 * is already finished and what is still locked, the clock of the open section,
 * and the early-finish action. The clock and the button stay in one place while
 * the student moves between questions; the server remains the judge of time.
 */
export function SectionRail({ sections, current, timing, serverTime, onFinish, onExpire, advancing }) {
  if (!sections?.length) return null;
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-line bg-white p-2 shadow-card" aria-label="Exam sections">
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
        {sections.map((s) => {
          const open = s.name === current;
          const done = s.state === 'completed';
          const expired = s.state === 'expired';
          const locked = !done && !expired && (s.locked || s.state === 'locked');
          return (
            <span key={s.name} aria-current={open ? 'step' : undefined}
              className={cx('inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs',
                open ? 'border-primary bg-primary-soft text-ink'
                  : done ? 'border-ok/30 bg-ok-soft/50 text-muted'
                    : expired ? 'border-red-200 bg-danger-soft/60 text-danger-ink'
                      : 'border-line bg-white text-muted')}>
              {done ? <Check size={12} className="text-ok-ink" aria-hidden />
                : expired ? <TriangleAlert size={12} aria-hidden />
                  : <span className="tnum font-semibold">{s.first + 1}</span>}
              <span className="font-medium">{s.name}</span>
              <span className="tnum opacity-70">{done ? 'Done' : expired ? 'Time ended' : locked ? 'Locked' : `${s.answered}/${s.total}`}</span>
            </span>
          );
        })}
      </div>
      <div className="ml-auto flex items-center gap-2">
        {current && <SectionCountdown timing={timing} serverTime={serverTime} onExpire={onExpire} />}
        {onFinish && <Button size="sm" variant="secondary" onClick={onFinish} loading={advancing}>Finish section</Button>}
      </div>
    </div>
  );
}

/**
 * Shown instead of the question while the exam is not in fullscreen. The
 * question is not rendered at all, so it cannot be read off the screen.
 */
export function FullscreenBlocker({ onReturn }) {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center gap-4 rounded-2xl border border-line bg-white px-6 py-12 text-center shadow-card" role="alert" aria-label="Fullscreen required">
      <span className="grid h-14 w-14 place-items-center rounded-full bg-primary-soft text-primary"><Maximize size={26} aria-hidden /></span>
      <div>
        <h2 className="text-lg font-semibold tracking-tight">Return to fullscreen to continue</h2>
        <p className="mt-1.5 text-sm leading-6 text-muted">The question is hidden while the exam is not in fullscreen. Leaving fullscreen counts as a warning.</p>
      </div>
      <Button onClick={onReturn}>Return to fullscreen</Button>
    </div>
  );
}

/* Big countdown used in the waiting room: red under 5 minutes. */
export function StartCountdown({ remainingSec }) {
  const { d, h, m, s } = splitHMS(remainingSec);
  const low = remainingSec < 300;
  const cells = [...(d ? [[d, 'Days']] : []), [h, 'Hours'], [m, 'Minutes'], [s, 'Seconds']];
  return (
    <div className={cx('tnum flex items-start justify-center gap-2 sm:gap-3', low ? 'text-danger-ink' : 'text-ink')} role="timer" aria-label={`Exam starts in ${d ? `${d} days ` : ''}${h} hours ${m} minutes ${s} seconds`}>
      {cells.map(([v, l], i) => (
        <div key={l} className="flex items-start gap-2 sm:gap-3">
          <div className="text-center"><div className="text-4xl font-semibold leading-none sm:text-5xl">{pad(v)}</div><div className="mt-2 text-xs text-muted">{l}</div></div>
          {i < cells.length - 1 && <div className="text-3xl font-light leading-none text-line sm:text-4xl" aria-hidden>:</div>}
        </div>
      ))}
    </div>
  );
}

export function AutosaveChip({ state }) {
  const map = {
    saved: ['ok', <Check size={12} key="i" />, 'Saved'],
    saving: ['blue', <Spinner size={12} key="i" />, 'Saving…'],
    failed: ['danger', <TriangleAlert size={12} key="i" />, 'Not saved — retrying'],
  };
  const [tone, icon, label] = map[state] || map.saved;
  return <Badge tone={tone} icon={icon}><span role="status">{label}</span></Badge>;
}

export function ProctorWarningBanner({ warning, onDismiss, onReturnFullscreen, fullscreen }) {
  if (!warning) return null;
  if (warning.locked) {
    return (
      <Banner tone="error" className="mx-auto w-full max-w-3xl" title="Exam ended">
        {warning.reason} Your exam was submitted and graded, and you have been signed out. If you believe this is a mistake, contact the exam team.
      </Banner>
    );
  }
  const flagged = Number(warning.count) >= Number(warning.max || 3);
  return (
    <Banner tone={flagged ? 'danger' : 'warn'} className="mx-auto w-full max-w-3xl"
      title={flagged ? `Integrity warnings: ${warning.count} — final warning` : `Integrity warning ${warning.count} — ${warning.reason}`}
      action={<div className="flex gap-2">
        {!fullscreen && <Button size="sm" variant="secondary" onClick={onReturnFullscreen}>Return to fullscreen</Button>}
        <Button size="sm" variant="ghost" onClick={onDismiss}>Dismiss</Button>
      </div>}>
      {flagged
        ? `${warning.reason} This was the final warning; your exam has been submitted.`
        : 'This was recorded for the exam team. You can continue.'}
    </Banner>
  );
}

export function AnswerOption({ letter, text, checked, disabled, onSelect, name }) {
  return (
    <label className={cx('group flex cursor-pointer items-start gap-3.5 rounded-xl border bg-white px-4 py-4 transition-colors select-none', checked ? 'border-primary bg-primary-soft shadow-[0_0_0_1px_rgba(37,99,235,0.18)]' : 'border-line hover:border-primary/30 hover:bg-primary-soft/30', disabled && 'cursor-not-allowed opacity-70', 'has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-primary')}>
      <input type="radio" name={name} checked={checked} disabled={disabled} onChange={onSelect} className="sr-only" />
      <span aria-hidden className={cx('mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full border text-sm font-semibold', checked ? 'border-primary bg-primary text-white' : 'border-line bg-white text-muted group-hover:border-primary/30')}>{checked ? <Check size={15} /> : letter}</span>
      <span className="min-w-0 text-[15px] leading-6 text-body sm:text-base"><span className="sr-only">Option {letter}: </span>{text}</span>
    </label>
  );
}

function NavigatorContent({ sections, current, answers, onGo, disabled }) {
  return (
    <div className="space-y-5">
      {sections.map((s) => {
        const count = s.questions.filter((q) => answers[q.id] !== undefined).length;
        const locked = !!s.timing?.locked;
        const state = s.timing?.state;
        const stateLabel = state === 'completed' ? ' - finished' : state === 'expired' ? ' - time ended' : state === 'locked' ? ' - locked' : '';
        return (
          <section key={s.name}>
            <div className="mb-2.5 flex items-center justify-between gap-2">
              <h3 className={cx('text-xs font-semibold uppercase tracking-wide', locked ? 'text-danger' : 'text-muted')}>{s.name}{stateLabel}</h3>
              <span className="tnum text-[11px] text-muted">{count}/{s.questions.length}</span>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {s.questions.map((q) => {
                const ans = answers[q.id] !== undefined;
                const cur = q.n === current;
                const off = disabled || locked;
                return (
                  <button key={q.id} type="button" onClick={() => onGo(q.n)} disabled={off} aria-current={cur ? 'true' : undefined}
                    aria-label={`Question ${q.n + 1}, ${ans ? 'answered' : 'unanswered'}${cur ? ', current' : ''}${locked ? ', section time ended' : ''}`}
                    className={cx('tnum relative grid h-11 w-full place-items-center rounded-md border text-sm font-medium transition-colors', cur ? 'border-primary bg-primary text-white ring-2 ring-primary ring-offset-2' : ans ? 'border-ok/30 bg-ok-soft text-ok-ink hover:bg-ok-soft/70' : 'border-line bg-white text-body hover:border-primary/30 hover:bg-primary-soft', off && 'cursor-not-allowed opacity-60')}>
                    {q.n + 1}
                    {ans && !cur && <Check size={11} className="absolute right-0.5 top-0.5" aria-hidden />}
                  </button>
                );
              })}
            </div>
          </section>
        );
      })}
      <div className="flex flex-wrap gap-x-4 gap-y-2 border-t border-line pt-3 text-[11px] text-muted">
        <span className="inline-flex items-center gap-1.5"><span className="h-3 w-3 rounded-[3px] bg-primary ring-2 ring-primary ring-offset-1" aria-hidden />Current</span>
        <span className="inline-flex items-center gap-1.5"><span className="grid h-3 w-3 place-items-center rounded-[3px] border border-ok/30 bg-ok-soft text-ok-ink" aria-hidden><Check size={8} /></span>Answered</span>
        <span className="inline-flex items-center gap-1.5"><span className="h-3 w-3 rounded-[3px] border border-line bg-white" aria-hidden />Unanswered</span>
      </div>
    </div>
  );
}

export function QuestionNavigator({ open, onClose, sections, current, answers, onGo, disabled }) {
  return (
    <Drawer open={open} onClose={onClose} title="Question Navigator" description="Choose any question to jump to it."
      footer={<Button variant="secondary" className="w-full" onClick={onClose}>Close</Button>}>
      <NavigatorContent sections={sections} current={current} answers={answers} disabled={disabled} onGo={(n) => { onGo(n); onClose(); }} />
    </Drawer>
  );
}

export function QuestionNavigatorPanel({ sections, current, answers, onGo, disabled, className }) {
  const total = sections.reduce((n, s) => n + s.questions.length, 0);
  const answered = sections.reduce((n, s) => n + s.questions.filter((q) => answers[q.id] !== undefined).length, 0);
  return (
    <aside className={cx('rounded-xl border border-line bg-white shadow-card', className)}>
      <div className="border-b border-line px-4 py-3.5">
        <h2 className="text-sm font-semibold tracking-tight">Question Navigator</h2>
        <p className="tnum mt-0.5 text-xs text-muted">{answered} of {total} answered</p>
      </div>
      <div className="max-h-[calc(100dvh-13rem)] overflow-y-auto p-4">
        <NavigatorContent sections={sections} current={current} answers={answers} disabled={disabled} onGo={onGo} />
      </div>
    </aside>
  );
}

export function SubmitDialog({ open, onClose, onConfirm, answered, total, loading, error }) {
  const un = Math.max(0, total - answered);
  const tiles = [
    ['Answered', answered, Check, 'border-green-200 bg-ok-soft text-ok-ink'],
    ['Unanswered', un, CircleAlert, un > 0 ? 'border-amber-200 bg-warn-soft text-warn-ink' : 'border-line bg-white text-body'],
    ['Total', total, BookOpenCheck, 'border-blue-100 bg-primary-soft text-primary'],
  ];
  return (
    <Modal open={open} onClose={loading ? undefined : onClose} dismissible={!loading} title="Confirm Submission" size="sm"
      description="Review your attempt before submitting. Answers cannot be changed afterwards."
      footer={<><Button variant="secondary" onClick={onClose} disabled={loading}>Back to Exam</Button><Button onClick={onConfirm} loading={loading} className="min-w-28">Submit Exam</Button></>}>
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-primary-soft text-primary"><ShieldCheck size={26} aria-hidden /></div>
      <p className="mt-3 text-center text-sm text-muted">You have answered <span className="tnum font-semibold text-ink">{answered}</span> out of <span className="tnum font-semibold text-ink">{total}</span> questions.</p>
      {error && <Banner tone="error" className="mt-3">{error}</Banner>}
      <dl className="tnum mt-4 grid grid-cols-3 gap-2 text-center">
        {tiles.map(([label, value, Icon, cls]) => (
          <div key={label} className={cx('flex flex-col-reverse rounded-lg border px-2 py-3', cls)}>
            <dt className="mt-1 flex items-center justify-center gap-1 text-[11px] font-medium"><Icon size={11} aria-hidden />{label}</dt>
            <dd className="text-xl font-semibold leading-none">{value}</dd>
          </div>
        ))}
      </dl>
      {un > 0 && <p className="mt-3 rounded-lg bg-warn-soft px-3 py-2 text-xs leading-5 text-warn-ink">You still have {un} unanswered {un === 1 ? 'question' : 'questions'}. You can go back and review them before submitting.</p>}
    </Modal>
  );
}
