import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { ArrowRight, CalendarDays, Check, Clock, Layers, RefreshCw, ShieldCheck, Timer } from 'lucide-react';
import { api, auth } from '../../lib/api.js';
import { useServerClock } from '../../hooks/useServerClock.js';
import { fmtDateTime, fmtDuration, splitHMS } from '../../lib/format.js';
import { readDomainSelection, saveDomainSelection, clearDomainSelection } from '../../lib/domains.js';
import { Badge, Banner, Button, Skeleton } from '../../components/ui.jsx';
import { StudentHeader } from '../../components/StudentShell.jsx';
import { Aurora, FlipUnit, GlowButton, Item, LiveDot, Stagger } from '../../components/motion.jsx';

const Panel = ({ children }) => <div className="er-glass rounded-3xl p-6 sm:p-8">{children}</div>;

/** S2 — waiting room. Start time comes from the server; the countdown is display only. */
export default function Waiting() {
  const nav = useNavigate();
  const [data, setData] = useState(null);
  const [state, setState] = useState('loading'); // loading | ok | missing | removed | offline
  const [error, setError] = useState('');
  const now = useServerClock(data?.server_time);

  // The technical domains the student picked. Empty until the picker is used.
  const [picked, setPicked] = useState([]);

  const load = useCallback(async () => {
    setError('');
    try {
      const r = await api('/student/event', { role: 'student' });
      setData(r); setState('ok');
      if (r.submitted) nav('/result', { replace: true });
    } catch (e) {
      if (e.status === 404) setState('missing');
      else if (e.status === 403 && e.data?.code === 'removed') {
        auth.clear('student');
        setState('removed');
        setError(e.message);
      } else { setState((s) => (s === 'ok' ? 'ok' : 'offline')); setError(e.message); }
    }
  }, [nav]);
  useEffect(() => { load(); }, [load]);

  const ev = data?.event;
  const remaining = ev ? (Date.parse(ev.starts_at) - now) / 1000 : null;
  const started = ev && remaining <= 0;
  const paperTime = ev?.paper_minutes
    ? ev.min_paper_minutes && ev.min_paper_minutes !== ev.paper_minutes
      ? `${fmtDuration(ev.min_paper_minutes)} - ${fmtDuration(ev.paper_minutes)}`
      : fmtDuration(ev.paper_minutes)
    : 'Set per paper';

  useEffect(() => {
    setPicked(ev?.id ? readDomainSelection(ev.id) : []);
  }, [ev?.id]);

  // Re-confirm with the server the moment our display clock reaches the start time.
  const [confirmed, setConfirmed] = useState(false);
  useEffect(() => { if (started && !confirmed) { setConfirmed(true); load(); } }, [started, confirmed, load]);

  const domains = data?.domains;
  const domainMode = domains?.enabled ? 'select' : 'fixed';

  // The domains of a paper that already exists are frozen - the student may
  // not change them, and the picker is not shown again.
  const frozen = Array.isArray(domains?.selected) && domains.selected.length > 0;
  const allowed = domainMode === 'select' ? domains.allowed || [] : [];
  const min = Number(domains?.min || 1);
  const max = Number(domains?.max || 1);

  const toggle = (code) => {
    setPicked((current) => {
      if (current.includes(code)) return current.filter((c) => c !== code);
      if (current.length >= max) return current;
      return [...current, code];
    });
  };

  const ready = domainMode !== 'select' || frozen || (picked.length >= min && picked.length <= max);

  // A choice that the server already has (the paper exists) or that this
  // event does not ask for is dropped, so a stale choice never reaches the
  // next exam.
  useEffect(() => {
    if (state !== 'ok' || !domains) return;
    if (!domains.enabled || (domains.selected || []).length) clearDomainSelection(ev?.id);
  }, [state, domains, ev?.id]);

  const planned = (() => {
    const common = (domains?.common || []).reduce((sum, c) => sum + Number(c.count || 0), 0);
    const technical = picked.reduce((sum, code) => {
      const found = allowed.find((d) => d.code === code);
      return sum + Number(found?.count || 0);
    }, 0);
    return common + technical;
  })();

  const begin = () => {
    if (domainMode === 'select' && !frozen) saveDomainSelection(ev?.id, picked);
    nav('/exam');
  };

  const { d, h, m, s: sec } = splitHMS(remaining ?? 0);
  const low = !started && remaining != null && remaining < 300;

  return (
    <div className="relative isolate min-h-screen overflow-hidden">
      <Aurora tone={low ? 'red' : 'blue'} />
      <StudentHeader />
      <main className="mx-auto max-w-2xl px-4 py-10">
        {state === 'loading' && <Panel><div aria-busy="true" className="space-y-4"><Skeleton className="h-6 w-2/3" /><Skeleton className="h-20" /><Skeleton className="h-24" /></div></Panel>}

        {state === 'missing' && (
          <Panel><Banner tone="error" title="We couldn't find an active exam for this sign-in." action={<Button size="sm" variant="secondary" onClick={() => { nav('/'); }}>Back to sign in</Button>}>Check that you used the invited email address.</Banner></Panel>
        )}

        {state === 'removed' && (
          <Panel><Banner tone="error" title="Your access to this exam was removed." action={<Button size="sm" variant="secondary" onClick={() => nav('/')}>Back to sign in</Button>}>{error || 'Contact the exam team if you think this is a mistake.'}</Banner></Panel>
        )}

        {state === 'offline' && (
          <Panel><Banner tone="warn" title="Exam status is temporarily unavailable." action={<Button size="sm" variant="secondary" onClick={load}><RefreshCw size={14} />Retry</Button>}>{error} We won't show a countdown until the server confirms the start time.</Banner></Panel>
        )}

        {state === 'ok' && ev && (
          <Stagger>
            <Item className="mb-5 text-center">
              <span className="er-glass inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-medium">
                {started ? <><LiveDot tone="ok" />Ready</> : <><LiveDot tone="blue" />Waiting for exam</>}
              </span>
              <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">{ev.name}</h1>
            </Item>

            <Item>
              <Panel>
                <div className="grid gap-3 sm:grid-cols-3">
                  {[[CalendarDays, 'Start time', fmtDateTime(ev.starts_at)], [Clock, 'Exam window', fmtDuration(ev.duration_min)], [Timer, 'Paper time', paperTime]].map(([Icon, k, v]) => (
                    <motion.div key={k} whileHover={{ y: -2 }} className="flex items-center gap-3 rounded-2xl border border-line/70 bg-white/70 px-4 py-3">
                      <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary-soft text-primary"><Icon size={18} aria-hidden /></span>
                      <div><p className="text-xs text-muted">{k}</p><p className="tnum text-sm font-semibold">{v}</p></div>
                    </motion.div>
                  ))}
                </div>

                <div className="mt-6 text-center">
                  {started ? (
                    <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="space-y-5 py-6">
                      <p className="text-2xl font-semibold">Your exam is ready.</p>
                      <motion.div animate={{ boxShadow: ['0 0 0 0 rgb(37 99 235 / .35)', '0 0 0 18px rgb(37 99 235 / 0)'] }} transition={{ duration: 1.8, repeat: Infinity }} className="inline-block rounded-xl">
                        <GlowButton onClick={begin} disabled={!ready} className="h-12 px-8 text-base">Begin Exam<ArrowRight size={16} aria-hidden /></GlowButton>
                      </motion.div>
                      {!ready && <p className="text-sm text-warn-ink">Choose your technical domain below to continue.</p>}
                    </motion.div>
                  ) : (
                    <div className="space-y-6 py-2">
                      <p className="text-sm text-muted">The exam has not started yet. Exam will start in</p>
                      <div role="timer" aria-label={`Exam starts in ${d ? `${d} days ` : ''}${h} hours ${m} minutes ${sec} seconds`} className="flex items-start justify-center gap-2 sm:gap-3">
                        {d > 0 && <><FlipUnit value={d} label="Days" danger={low} /><span className="pt-8 text-3xl font-light text-slate-300" aria-hidden>:</span></>}
                        <FlipUnit value={h} label="Hours" danger={low} /><span className="pt-8 text-3xl font-light text-slate-300" aria-hidden>:</span>
                        <FlipUnit value={m} label="Minutes" danger={low} /><span className="pt-8 text-3xl font-light text-slate-300" aria-hidden>:</span>
                        <FlipUnit value={sec} label="Seconds" danger={low} />
                      </div>
                      {low && <p className="text-sm font-medium text-danger">Less than 5 minutes to go.</p>}
                    </div>
                  )}
                </div>

                {/* The domain picker sits above the exam, in the waiting room,
                    so the choice is made before the timer starts. */}
                {domainMode === 'select' && (
                  <section className="mt-6 rounded-2xl border border-line/70 bg-white/70 p-5" aria-labelledby="domain-picker-title">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h2 id="domain-picker-title" className="flex items-center gap-2 text-base font-semibold text-ink">
                          <Layers size={17} className="text-primary" aria-hidden />Choose your technical domain
                        </h2>
                        <p className="mt-1 text-sm text-muted">
                          {frozen
                            ? 'Your domains are locked in. You can resume the exam below.'
                            : `Pick ${min === max ? min : `${min} to ${max}`} domain${max === 1 ? '' : 's'}. The questions are from the domain you choose.`}
                        </p>
                      </div>
                      <Badge tone={frozen ? 'blue' : picked.length >= min ? 'ok' : 'neutral'}>
                        {frozen ? `${domains.selected.length} chosen` : `${picked.length} of ${max} chosen`}
                      </Badge>
                    </div>

                    {!!domains.common?.length && (
                      <div className="mt-4 rounded-xl border border-line/70 bg-canvas/70 px-4 py-3">
                        <p className="text-xs font-semibold uppercase tracking-wide text-muted">Every exam includes</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {domains.common.map((c) => (
                            <span key={c.code} className="inline-flex items-center gap-1.5 rounded-md border border-line bg-white px-2.5 py-1 text-sm text-body">
                              {c.name}<span className="tnum text-xs text-muted">{c.count} questions</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {!frozen && (
                      <>
                        <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
                          {allowed.map((d) => {
                            const on = picked.includes(d.code);
                            const full = !on && picked.length >= max;
                            return (
                              <button
                                key={d.code}
                                type="button"
                                onClick={() => toggle(d.code)}
                                disabled={full}
                                aria-pressed={on}
                                className={[
                                  'flex items-center justify-between gap-3 rounded-lg border px-4 py-3 text-left transition',
                                  on
                                    ? 'border-primary bg-primary-soft/60 ring-1 ring-primary/30'
                                    : 'border-line bg-white hover:border-primary/40 hover:bg-primary-soft/20',
                                  full ? 'cursor-not-allowed opacity-50' : '',
                                ].join(' ')}
                              >
                                <span className="min-w-0">
                                  <span className="block truncate text-sm font-medium text-ink">{d.name}</span>
                                  <span className="tnum block text-xs text-muted">{d.count} questions</span>
                                </span>
                                <span className={[
                                  'grid h-5 w-5 shrink-0 place-items-center rounded-md border',
                                  on ? 'border-primary bg-primary text-white' : 'border-line bg-white',
                                ].join(' ')}>
                                  {on && <Check size={13} strokeWidth={3} aria-hidden />}
                                </span>
                              </button>
                            );
                          })}
                        </div>

                        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                          <p className="text-sm text-muted">
                            {picked.length < min
                              ? `Choose at least ${min} domain${min === 1 ? '' : 's'} to continue.`
                              : `${planned} questions in this paper.`}
                          </p>
                          <p className="tnum text-sm font-medium text-ink">{planned} questions</p>
                        </div>
                      </>
                    )}

                    {frozen && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {domains.selected.map((code) => (
                          <span key={code} className="inline-flex items-center gap-1.5 rounded-md border border-primary/30 bg-primary-soft/60 px-2.5 py-1 text-sm text-ink">
                            <Check size={13} className="text-primary" aria-hidden />{code}
                          </span>
                        ))}
                      </div>
                    )}
                  </section>
                )}

                <div className="mt-6 flex gap-3 rounded-2xl border border-blue-100 bg-primary-soft/70 px-4 py-3 text-sm text-blue-900">
                  <ShieldCheck size={18} className="mt-0.5 shrink-0 text-primary" aria-hidden />
                  <p className="whitespace-pre-wrap">{ev.instructions ? `${ev.instructions} ` : ''}Please stay on this page. You can begin when the exam is ready.</p>
                </div>
                <p className="mt-3 text-center text-xs text-muted">
                  This exam may require Safe Exam Browser.{' '}
                  <button type="button" onClick={() => nav('/seb')} className="font-medium text-primary hover:underline">Open the SEB setup page</button>
                </p>
                {error && <Banner tone="warn" className="mt-3" action={<Button size="sm" variant="secondary" onClick={load}>Retry</Button>}>Could not refresh exam status. {error}</Banner>}
              </Panel>
            </Item>
          </Stagger>
        )}
      </main>
    </div>
  );
}
