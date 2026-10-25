import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowRight, CalendarDays, Check, Clock, Info, Layers, RefreshCw, ShieldCheck } from 'lucide-react';
import { api } from '../../lib/api.js';
import { useServerClock } from '../../hooks/useServerClock.js';
import { fmtDateTime, fmtDuration } from '../../lib/format.js';
import { Badge, Banner, Button, Card, Skeleton } from '../../components/ui.jsx';
import { StudentHeader } from '../../components/StudentShell.jsx';
import { StartCountdown } from '../../components/exam/parts.jsx';
import { readDomainSelection, saveDomainSelection, clearDomainSelection } from '../../lib/domains.js';

/** S2 — waiting room. Start time comes from the server; the countdown is display only. */
export default function Waiting() {
  const nav = useNavigate();
  const [data, setData] = useState(null);
  const [state, setState] = useState('loading'); // loading | ok | missing | offline
  const [error, setError] = useState('');
  const now = useServerClock(data?.server_time);

  // The technical domains the student picked. Empty until the picker is used.
  const [picked, setPicked] = useState(() => readDomainSelection());

  const load = useCallback(async () => {
    setError('');
    try {
      const r = await api('/student/event', { role: 'student' });
      setData(r); setState('ok');
      if (r.submitted) nav('/result', { replace: true });
    } catch (e) {
      if (e.status === 404) setState('missing');
      else { setState((s) => (s === 'ok' ? 'ok' : 'offline')); setError(e.message); }
    }
  }, [nav]);
  useEffect(() => { load(); }, [load]);

  const ev = data?.event;
  const remaining = ev ? (Date.parse(ev.starts_at) - now) / 1000 : null;
  const started = ev && remaining <= 0;

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
    if (!domains.enabled || (domains.selected || []).length) clearDomainSelection();
  }, [state, domains]);

  const planned = (() => {
    const common = (domains?.common || []).reduce((sum, c) => sum + Number(c.count || 0), 0);
    const technical = picked.reduce((sum, code) => {
      const found = allowed.find((d) => d.code === code);
      return sum + Number(found?.count || 0);
    }, 0);
    return common + technical;
  })();

  const begin = () => {
    if (domainMode === 'select' && !frozen) saveDomainSelection(picked);
    nav('/exam');
  };

  return (
    <div className="min-h-screen">
      <StudentHeader />
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
        {state === 'loading' && (
          <Card className="space-y-5 p-6 sm:p-8" aria-busy="true">
            <div className="space-y-2"><Skeleton className="h-4 w-24" /><Skeleton className="h-8 w-2/3" /></div>
            <Skeleton className="h-36 w-full" />
            <Skeleton className="h-24 w-full" />
          </Card>
        )}

        {state === 'missing' && (
          <Card className="mx-auto max-w-xl p-6 sm:p-8">
            <Banner tone="error" title="We couldn't find an active exam for this sign-in." action={<Button size="sm" variant="secondary" onClick={() => nav('/')}>Back to sign in</Button>}>Check that you used the invited email address.</Banner>
          </Card>
        )}

        {state === 'offline' && (
          <Card className="mx-auto max-w-xl p-6 sm:p-8">
            <Banner tone="warn" title="Exam status is temporarily unavailable." action={<Button size="sm" variant="secondary" onClick={load}><RefreshCw size={14} aria-hidden />Retry</Button>}>{error} We won't show a countdown until the server confirms the start time.</Banner>
          </Card>
        )}

        {state === 'ok' && ev && (
          <div>
            <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Your next exam</p>
                <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">{ev.name}</h1>
              </div>
              {started ? <Badge tone="ok">Ready to begin</Badge> : <Badge tone="blue">Scheduled</Badge>}
            </div>

            <Card className="overflow-hidden">
              <div className="relative border-b border-line bg-gradient-to-br from-ice via-primary-soft/70 to-white p-6 sm:p-8">
                <div className="pointer-events-none absolute -right-14 -top-16 h-52 w-52 rounded-full bg-white/50" aria-hidden />
                <div className="pointer-events-none absolute -bottom-24 right-24 h-40 w-40 rounded-full bg-primary/5" aria-hidden />
                <div className="relative grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
                  <div>
                    <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">{started ? 'Your exam is ready.' : 'Get ready for your exam.'}</h2>
                    <p className="mt-2 max-w-lg text-sm leading-6 text-muted">Check the schedule, review the instructions, and make sure you are ready before you begin.</p>
                    <div className="mt-5 flex flex-wrap gap-2.5">
                      <span className="inline-flex items-center gap-2 rounded-md border border-white/80 bg-white/70 px-3 py-2 text-sm text-body"><CalendarDays size={16} className="text-primary" aria-hidden /><span className="text-xs text-muted">Starts</span><span className="tnum font-medium">{fmtDateTime(ev.starts_at)}</span></span>
                      <span className="inline-flex items-center gap-2 rounded-md border border-white/80 bg-white/70 px-3 py-2 text-sm text-body"><Clock size={16} className="text-primary" aria-hidden /><span className="text-xs text-muted">Duration</span><span className="tnum font-medium">{fmtDuration(ev.duration_min)}</span></span>
                    </div>
                  </div>
                  <div className="relative mx-auto grid h-28 w-28 place-items-center rounded-2xl border border-white/80 bg-white/75 shadow-card" aria-hidden>
                    <CalendarDays size={44} className="text-primary/80" strokeWidth={1.4} />
                    <span className="absolute -bottom-3 -right-3 grid h-11 w-11 place-items-center rounded-xl bg-primary text-white shadow-[0_8px_20px_-8px_rgba(37,99,235,0.8)]"><ShieldCheck size={20} /></span>
                  </div>
                </div>
              </div>

              <div className="p-6 sm:p-8">
                <div className="rounded-xl border border-line bg-canvas/60 px-4 py-8 text-center sm:py-10">
                  {started ? (
                    <div className="mx-auto max-w-md space-y-4">
                      <p className="text-lg font-semibold text-ink">You can begin now.</p>
                      <p className="text-sm text-muted">When you are ready, continue to the exam setup. Your time starts after the exam is loaded.</p>
                      <Button size="lg" onClick={begin} disabled={!ready}>Begin Exam<ArrowRight size={16} aria-hidden /></Button>
                    </div>
                  ) : (
                    <div className="space-y-5">
                      <p className="text-sm text-muted">The exam has not started yet. Exam will start in</p>
                      <StartCountdown remainingSec={remaining} />
                      {remaining < 300 && <p className="inline-flex items-center gap-1.5 text-sm font-medium text-warn-ink"><Info size={14} aria-hidden />Less than 5 minutes to go.</p>}
                    </div>
                  )}
                </div>

                {/* The domain picker. It sits above the exam, in the waiting room,
                    so the choice is made before the timer starts. */}
                {domainMode === 'select' && (
                  <section className="mt-5 rounded-xl border border-line bg-white p-5 sm:p-6" aria-labelledby="domain-picker-title">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h3 id="domain-picker-title" className="flex items-center gap-2 text-base font-semibold text-ink">
                          <Layers size={17} className="text-primary" aria-hidden />Choose your technical domain
                        </h3>
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
                      <div className="mt-4 rounded-lg border border-line bg-canvas/70 px-4 py-3">
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

                {!started && <p className="mt-3 text-center text-xs text-muted">Please stay on this page. You can begin when the exam is ready.</p>}
                <p className="mt-3 text-center text-xs text-muted">
                  This exam may require Safe Exam Browser.{' '}
                  <button type="button" onClick={() => nav('/seb')} className="font-medium text-primary hover:underline">Open the SEB setup page</button>
                </p>

                {ev.instructions && (
                  <div className="mt-5 rounded-xl border border-line bg-primary-soft/50 p-4">
                    <p className="flex items-center gap-2 text-sm font-medium text-ink"><Info size={16} className="text-primary" aria-hidden />Instructions from your exam team</p>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-body">{ev.instructions}</p>
                  </div>
                )}

                {error && <Banner tone="warn" className="mt-4" action={<Button size="sm" variant="secondary" onClick={load}>Retry</Button>}>Could not refresh exam status. {error}</Banner>}
              </div>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
