import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { CircleCheckBig, LogOut } from 'lucide-react';
import { api, auth } from '../../lib/api.js';
import { fmtDateTime } from '../../lib/format.js';
import { Badge, Banner, Button, Card, Skeleton, Tabs, Textarea, cx } from '../../components/ui.jsx';
import { StudentHeader } from '../../components/StudentShell.jsx';

const LABELS = ['Poor', 'Fair', 'Good', 'Very good', 'Excellent'];

function Ring({ value, max }) {
  const pct = max ? value / max : 0;
  const r = 52, c = 2 * Math.PI * r;
  return (
    <div className="relative grid h-36 w-36 place-items-center" role="img" aria-label={`Score ${value} out of ${max}`}>
      <svg viewBox="0 0 120 120" className="absolute inset-0 -rotate-90"><circle cx="60" cy="60" r={r} fill="none" stroke="#DCE7F4" strokeWidth="9" /><circle cx="60" cy="60" r={r} fill="none" stroke="#2563EB" strokeWidth="9" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - pct)} /></svg>
      <div className="tnum text-center"><div className="text-3xl font-semibold leading-none">{value}<span className="text-base font-normal text-muted"> / {max}</span></div><div className="mt-1 text-xs text-muted">Total score</div></div>
    </div>
  );
}

/** S5 — result. All numbers come from the server's grading; nothing is computed here except display. */
export default function Result() {
  const nav = useNavigate();
  const [res, setRes] = useState(null);
  const [error, setError] = useState(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [fbErr, setFbErr] = useState('');
  const [view, setView] = useState('skills');

  useEffect(() => {
    let alive = true;
    api('/exam/result', { role: 'student' }).then((r) => { if (alive) { setRes(r); setSent(r.feedback_sent); } })
      .catch((e) => {
        if (!alive) return;
        if (e.status === 409 && e.data?.code === 'active') nav('/exam', { replace: true });
        else setError(e.status === 404 ? 'No result found for this sign-in.' : e.message);
      });
    return () => { alive = false; };
  }, [nav]);

  const sendFeedback = async (e) => {
    e.preventDefault();
    if (!rating) { setFbErr('Choose a rating from 1 to 5.'); return; }
    setBusy(true); setFbErr('');
    try { await api('/exam/feedback', { method: 'POST', role: 'student', body: { rating, comment } }); setSent(true); }
    catch (ex) { if (ex.status === 409 && /already/i.test(ex.message)) setSent(true); else setFbErr(ex.message); }
    finally { setBusy(false); }
  };
  const finish = () => { auth.clear('student'); nav('/', { replace: true }); };

  return (
    <div className="min-h-screen">
      <StudentHeader />
      <main className="mx-auto max-w-4xl space-y-5 px-4 py-8 sm:px-6 sm:py-10">
        {error && <Banner tone="error" title="Could not load your result.">{error}</Banner>}
        {!res && !error && <Card className="space-y-4 p-6 sm:p-8" aria-busy="true"><Skeleton className="h-8 w-64" /><Skeleton className="h-36" /></Card>}
        {res && (
          <>
            <Card className="overflow-hidden">
              <div className="relative border-b border-line bg-gradient-to-br from-ok-soft/80 via-white to-primary-soft/50 p-6 sm:p-8">
                <div className="pointer-events-none absolute -right-10 -top-16 h-44 w-44 rounded-full bg-white/60" aria-hidden />
                <div className="relative flex flex-wrap items-start justify-between gap-4">
                  <div className="flex gap-4">
                    <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full border border-green-200 bg-white text-ok-ink shadow-card"><CircleCheckBig size={28} aria-hidden /></span>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ok-ink">Attempt complete</p>
                      <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">Exam Submitted Successfully!</h1>
                      <p className="mt-1.5 max-w-xl text-sm leading-6 text-muted">{res.event_name} — your responses were recorded on <span className="tnum text-body">{fmtDateTime(res.submitted_at)}</span>.</p>
                    </div>
                  </div>
                  <Badge tone="ok">Submitted</Badge>
                </div>
              </div>
              <div className="p-6 sm:p-8">
                {res.submit_reason && res.submit_reason !== 'student' && (
                  <Banner tone="warn" className="mb-4" live={false}>{{ max_warnings: 'Your exam was submitted automatically after the maximum number of warnings.', time_expired: 'Your exam was submitted automatically when time ran out.', force_submit: 'Your exam was submitted by the exam team.' }[res.submit_reason]}</Banner>
                )}
                <dl className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-lg border border-line bg-canvas/50 px-4 py-3"><dt className="text-[11px] font-medium uppercase tracking-wide text-muted">Exam</dt><dd className="mt-1 truncate text-sm font-medium text-ink">{res.event_name}</dd></div>
                  <div className="rounded-lg border border-line bg-canvas/50 px-4 py-3"><dt className="text-[11px] font-medium uppercase tracking-wide text-muted">Submitted</dt><dd className="tnum mt-1 text-sm font-medium text-ink">{fmtDateTime(res.submitted_at)}</dd></div>
                  <div className="rounded-lg border border-line bg-canvas/50 px-4 py-3"><dt className="text-[11px] font-medium uppercase tracking-wide text-muted">Score</dt><dd className="tnum mt-1 text-sm font-medium text-ink">{res.total} / {res.max}</dd></div>
                </dl>
              </div>
            </Card>

            <Card className="p-6 sm:p-8">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div><h2 className="text-lg font-semibold tracking-tight">Your result</h2><p className="mt-0.5 text-sm text-muted">Score breakdown from your submitted attempt.</p></div>
                <Badge tone="blue">Graded</Badge>
              </div>
              <div className="mt-6 grid items-center gap-7 sm:grid-cols-[auto_1fr]">
                <div className="mx-auto sm:mx-0"><Ring value={res.total} max={res.max} /></div>
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">By section</h3>
                  <ul className="mt-2 divide-y divide-line">
                    {res.sections.map((s) => (
                      <li key={s.name} className="py-3">
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-sm font-medium text-body">{s.name}</span>
                          <span className="tnum text-sm text-body">{s.score} / {s.total}</span>
                        </div>
                        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-canvas" aria-hidden><div className="h-full rounded-full bg-primary" style={{ width: `${s.total ? Math.min(100, (s.score / s.total) * 100) : 0}%` }} /></div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Card>

            {/* What the exam measured: the competency the paper froze. */}
            {((res.competency?.skills?.length ?? 0) > 0 || (res.competency?.difficulties?.length ?? 0) > 0) && (
              <Card className="p-6 sm:p-8">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold tracking-tight">What this exam measured</h2>
                    <p className="mt-0.5 text-sm text-muted">Your score per skill and per difficulty.</p>
                  </div>
                  <Tabs label="Breakdown" value={view} onChange={setView} items={[['skills', 'By skill'], ['difficulties', 'By difficulty']]} />
                </div>
                <ul className="mt-5 divide-y divide-line">
                  {(view === 'skills' ? res.competency.skills : res.competency.difficulties).map((row) => (
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
              </Card>
            )}

            <Card className="p-6 sm:p-8">
              {sent ? <Banner tone="ok" title="Thank you for your feedback." live /> : (
                <form onSubmit={sendFeedback} className="space-y-4" noValidate>
                  <div><h2 className="text-lg font-semibold tracking-tight">We'd love your feedback</h2><p className="mt-0.5 text-sm text-muted">How was your exam experience?</p></div>
                  <fieldset>
                    <legend className="sr-only">Rating from 1 to 5</legend>
                    <div className="flex flex-wrap gap-2">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <label key={n} className={cx('tnum cursor-pointer rounded-md border px-3 py-2 text-sm transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-primary', rating === n ? 'border-primary bg-primary-soft text-primary' : 'border-line text-body hover:border-primary/30 hover:bg-primary-soft/30')}>
                          <input type="radio" name="rating" className="sr-only" checked={rating === n} onChange={() => setRating(n)} />{n} · {LABELS[n - 1]}
                        </label>
                      ))}
                    </div>
                  </fieldset>
                  <div><label htmlFor="fb" className="mb-1.5 block text-[13px] font-medium text-body">Comments (optional)</label><Textarea id="fb" rows={3} value={comment} onChange={(e) => setComment(e.target.value)} maxLength={1000} /></div>
                  {fbErr && <Banner tone="error">{fbErr}</Banner>}
                  <Button type="submit" loading={busy}>Send feedback</Button>
                </form>
              )}
            </Card>
            <div className="flex justify-end"><Button onClick={finish}><LogOut size={16} aria-hidden />Finish &amp; sign out</Button></div>
          </>
        )}
      </main>
    </div>
  );
}
