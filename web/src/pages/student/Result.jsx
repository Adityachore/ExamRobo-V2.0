import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { Check, Star } from 'lucide-react';
import { api, auth } from '../../lib/api.js';
import { fmtDateTime } from '../../lib/format.js';
import { Banner, Button, Skeleton, Tabs, Textarea, cx } from '../../components/ui.jsx';
import { Aurora, Burst, CountUp, GlowButton, Item, Stagger } from '../../components/motion.jsx';
import { StudentHeader } from '../../components/StudentShell.jsx';

const LABELS = ['Poor', 'Fair', 'Good', 'Very good', 'Excellent'];

function resultBlockedCopy(state) {
  if (!state) return null;
  if (state.code === 'finishing') {
    return {
      tone: 'info',
      title: 'Your submission is still being finalised.',
      body: 'The server has your answers. This page will show your result as soon as grading finishes; reload it in a moment.',
    };
  }
  if (state.code === 'removed') {
    return {
      tone: 'error',
      title: 'Your access to this exam was removed.',
      body: 'Your attempt has been recorded, but the exam team has removed your access to this result. Contact them if you think this is a mistake.',
    };
  }
  if (state.code === 'results_expired') {
    return {
      tone: 'warn',
      title: 'The result window has closed.',
      body: state.results_expires_at
        ? `Results were available until ${fmtDateTime(state.results_expires_at)}. Contact the exam team if you still need your score.`
        : 'Results are no longer available for this exam. Contact the exam team if you still need your score.',
    };
  }
  if (state.code === 'results_unavailable') {
    return {
      tone: 'warn',
      title: 'Results are not available for this exam.',
      body: 'The exam team has chosen not to publish results for this exam. Contact them if you have a question about your attempt.',
    };
  }
  if (state.visibility === 'after_all_submitted') {
    return {
      tone: 'info',
      title: 'Waiting for all participants.',
      body: 'Your attempt has been recorded. Results will be released after every participant has submitted. Sign in again later with the same email address to view your score.',
    };
  }
  return {
    tone: 'info',
    title: 'Results are not published yet.',
    body: 'Your attempt has been recorded. The exam team will publish results when they are ready. Sign in again later with the same email address to view your score.',
  };
}

function Ring({ value, max }) {
  const pct = max ? value / max : 0;
  const r = 56, c = 2 * Math.PI * r;
  return (
    <div className="relative grid h-44 w-44 place-items-center" role="img" aria-label={`Score ${value} out of ${max}`}>
      <svg viewBox="0 0 128 128" className="absolute inset-0 -rotate-90" aria-hidden>
        <defs><linearGradient id="rg" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stopColor="#2563eb" /><stop offset="1" stopColor="#38bdf8" /></linearGradient></defs>
        <circle cx="64" cy="64" r={r} fill="none" stroke="#e2e8f0" strokeWidth="10" />
        <motion.circle cx="64" cy="64" r={r} fill="none" stroke="url(#rg)" strokeWidth="10" strokeLinecap="round" strokeDasharray={c} initial={{ strokeDashoffset: c }} animate={{ strokeDashoffset: c * (1 - pct) }} transition={{ duration: 1.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] }} />
      </svg>
      <div className="tnum text-center"><div className="text-5xl font-semibold leading-none"><CountUp value={value} /><span className="text-lg font-normal text-muted"> / {max}</span></div><div className="mt-2 text-xs uppercase tracking-wider text-muted">Total score</div></div>
    </div>
  );
}

/** S5 — result. All numbers come from the server's grading; nothing is computed here except display. */
export default function Result() {
  const nav = useNavigate();
  const [res, setRes] = useState(null);
  const [pending, setPending] = useState(null);
  const [error, setError] = useState(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [fbErr, setFbErr] = useState('');
  const [view, setView] = useState('skills');

  useEffect(() => {
    let alive = true;
    let tries = 0;
    let timer = null;
    // The submission can land a moment after the runner navigates here. Retry a
    // few times instead of bouncing between /exam and /result, which used to
    // leave the student on a blank page. After the budget, show a terminal card.
    const load = async () => {
      try {
        const r = await api('/exam/result', { role: 'student' });
        if (!alive) return;
        setRes(r); setSent(r.feedback_sent); setPending(null); setError(null);
      } catch (e) {
        if (!alive) return;
        if (e.status === 409 && e.data?.code === 'active') {
          tries += 1;
          if (tries <= 6) { timer = setTimeout(load, 1000); return; }
          setPending({ code: 'finishing' });
          return;
        }
        if (e.status === 409 && e.data?.code === 'results_not_published') setPending(e.data);
        else if (e.status === 403 && ['results_unavailable', 'results_expired', 'removed'].includes(e.data?.code)) setPending(e.data);
        else setError(e.status === 404 ? 'No result found for this sign-in.' : e.message);
      }
    };
    load();
    return () => { alive = false; if (timer) clearTimeout(timer); };
  }, []);

  const sendFeedback = async (e) => {
    e.preventDefault();
    if (!rating) { setFbErr('Choose a rating from 1 to 5.'); return; }
    setBusy(true); setFbErr('');
    try { await api('/exam/feedback', { method: 'POST', role: 'student', body: { rating, comment } }); setSent(true); }
    catch (ex) { if (ex.status === 409 && /already/i.test(ex.message)) setSent(true); else setFbErr(ex.message); }
    finally { setBusy(false); }
  };
  const finish = () => { auth.clear('student'); nav('/', { replace: true }); };

  const celebrate = res && res.max > 0 && res.total / res.max >= 0.6 && (!res.submit_reason || res.submit_reason === 'student');
  const [hover, setHover] = useState(0);
  const blocked = resultBlockedCopy(pending);
  const sections = Array.isArray(res?.sections) ? res.sections : [];

  return (
    <div className="relative isolate min-h-screen overflow-hidden">
      <Aurora tone="green" />
      <StudentHeader />
      <main className="mx-auto max-w-3xl space-y-4 px-4 py-8">
        {error && <Banner tone="error" title="Could not load your result.">{error}</Banner>}
        {pending && blocked && (
          <div className="er-glass space-y-4 rounded-3xl p-6 sm:p-8">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Exam submitted</h1>
              <p className="mt-1 text-sm text-muted">Your attempt has been recorded. Your score is not visible on this page.</p>
            </div>
            <Banner tone={blocked.tone} title={blocked.title}>{blocked.body}</Banner>
            <div className="flex flex-wrap justify-end gap-2">
              {pending?.code === 'finishing' && <Button variant="secondary" onClick={() => window.location.reload()}>Reload</Button>}
              <Button onClick={finish}>Back to sign in</Button>
            </div>
          </div>
        )}
        {!res && !error && !pending && <div className="er-glass space-y-4 rounded-3xl p-6" aria-busy="true"><Skeleton className="h-6 w-48" /><Skeleton className="h-32" /></div>}
        {res && (
          <Stagger className="space-y-4">
            {celebrate && <Burst />}
            <Item className="er-glass rounded-3xl p-6 sm:p-8">
              <div className="flex items-center gap-4">
                <motion.span initial={{ scale: 0, rotate: -40 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 260, damping: 16, delay: 0.2 }} className="grid h-12 w-12 place-items-center rounded-2xl bg-ok-soft text-ok"><Check size={24} aria-hidden /></motion.span>
                <div><h1 className="text-2xl font-semibold tracking-tight">Exam result</h1><p className="text-sm text-muted">{res.event_name} — your exam has been submitted.</p></div>
              </div>
              {res.submit_reason && res.submit_reason !== 'student' && (
                <Banner tone="warn" className="mt-4" live={false}>{{ max_warnings: 'Your exam was submitted after the maximum number of warnings.', time_expired: 'Your exam was submitted automatically when time ran out.', force_submit: 'Your exam was submitted by the exam team.' }[res.submit_reason]}</Banner>
              )}
              <div className="mt-7 grid items-center gap-8 sm:grid-cols-[auto_1fr]">
                <div className="mx-auto"><Ring value={res.total} max={res.max} /></div>
                <div>
                  <h2 className="mb-3 text-xs font-medium uppercase tracking-wider text-muted">Section breakdown</h2>
                  <ul className="space-y-3">
                    {sections.map((sec, idx) => (
                      <li key={sec.name}>
                        <div className="mb-1 flex justify-between text-sm"><span>{sec.name}</span><span className="tnum font-medium">{sec.score} / {sec.total}</span></div>
                        <div className="h-2 overflow-hidden rounded-full bg-slate-100"><motion.div className="h-full rounded-full bg-gradient-to-r from-blue-600 to-sky-400" initial={{ width: 0 }} animate={{ width: `${sec.total ? (sec.score / sec.total) * 100 : 0}%` }} transition={{ duration: 1.1, delay: 0.5 + idx * 0.12, ease: [0.22, 1, 0.36, 1] }} /></div>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-4 text-sm text-muted">Submitted at <span className="tnum text-ink">{fmtDateTime(res.submitted_at)}</span></p>
                </div>
              </div>
            </Item>

            {((res.competency?.skills?.length ?? 0) > 0 || (res.competency?.difficulties?.length ?? 0) > 0) && (
              <Item className="er-glass rounded-3xl p-6 sm:p-8">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold tracking-tight">What this exam measured</h2>
                    <p className="mt-0.5 text-sm text-muted">Your score per skill and per difficulty.</p>
                  </div>
                  <Tabs label="Breakdown" value={view} onChange={setView} items={[['skills', 'By skill'], ['difficulties', 'By difficulty']]} />
                </div>
                <ul className="mt-5 divide-y divide-line">
                  {(view === 'skills' ? res.competency.skills : res.competency.difficulties)?.map((row) => (
                    <li key={view === 'skills' ? row.code ?? 'untagged' : `level-${row.level}`} className="flex items-center justify-between gap-4 py-3">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-body">{row.name || row.label}</p>
                        {view === 'skills' && row.category && <p className="text-xs text-muted">{row.category}</p>}
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="tnum text-sm text-body">{row.correct} / {row.total}</p>
                        {row.answered < row.total && <p className="tnum text-[11px] text-muted">{row.answered} answered</p>}
                      </div>
                    </li>
                  ))}
                </ul>
              </Item>
            )}

            <Item className="er-glass rounded-3xl p-6 sm:p-8">
              {sent ? (
                <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}><Banner tone="ok" title="Thank you for your feedback." live /></motion.div>
              ) : (
                <form onSubmit={sendFeedback} className="space-y-4" noValidate>
                  <div><h2 className="text-lg font-semibold">We'd love your feedback</h2><p className="text-sm text-muted">How was your exam experience?</p></div>
                  <fieldset>
                    <legend className="sr-only">Rating from 1 to 5</legend>
                    <div className="flex items-center gap-1" onMouseLeave={() => setHover(0)}>
                      {[1, 2, 3, 4, 5].map((n) => {
                        const on = n <= (hover || rating);
                        return (
                          <label key={n} onMouseEnter={() => setHover(n)} className="cursor-pointer rounded-lg p-1 has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-primary">
                            <input type="radio" name="rating" className="sr-only" checked={rating === n} onChange={() => setRating(n)} aria-label={`${n} — ${LABELS[n - 1]}`} />
                            <motion.span whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }} animate={{ scale: rating === n ? [1, 1.3, 1] : 1 }} className="block"><Star size={30} className={cx('transition-colors', on ? 'fill-amber-400 text-amber-400' : 'text-slate-300')} aria-hidden /></motion.span>
                          </label>
                        );
                      })}
                      <span className="ml-3 text-sm font-medium text-muted" aria-live="polite">{LABELS[(hover || rating) - 1] || ''}</span>
                    </div>
                  </fieldset>
                  <div><label htmlFor="fb" className="mb-1.5 block text-[13px] font-medium">Comments (optional)</label><Textarea id="fb" rows={3} value={comment} onChange={(e) => setComment(e.target.value)} maxLength={1000} className="rounded-xl" /></div>
                  {fbErr && <Banner tone="error">{fbErr}</Banner>}
                  <GlowButton type="submit" loading={busy} shine={false}>Send feedback</GlowButton>
                </form>
              )}
            </Item>
            <Item className="flex justify-end"><Button onClick={finish}>Finish &amp; sign out</Button></Item>
          </Stagger>
        )}
      </main>
    </div>
  );
}
