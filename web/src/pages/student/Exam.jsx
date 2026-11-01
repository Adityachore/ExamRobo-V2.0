import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { AnimatePresence, motion } from 'motion/react';
import { Check, Maximize, ShieldAlert, ShieldCheck } from 'lucide-react';
import { api, auth } from '../../lib/api.js';
import { readDomainSelection } from '../../lib/domains.js';
import { SEB_HELP_PATH, isSebBrowser } from '../../lib/seb.js';
import { fmtDateTime, fmtDuration } from '../../lib/format.js';
import { Banner, Button, Logo, Spinner } from '../../components/ui.jsx';
import { Aurora, GlowButton, Item, Reveal, Stagger } from '../../components/motion.jsx';
import Runner from '../../components/exam/Runner.jsx';
import Locked, { rememberLockNotice } from './Locked.jsx';

const STEPS = { fullscreen: 'Requesting fullscreen…', paper: 'Loading your paper…' };
const STEP_LIST = [['fullscreen', 'Fullscreen', Maximize], ['paper', 'Your paper', ShieldCheck]];
const RULES = [
  [ShieldCheck, 'Start in Safe Exam Browser', 'The exam opens only in Safe Exam Browser on Windows. You can sign in and wait in your normal browser, but starting the exam requires SEB.'],
  [Maximize, 'Stay in fullscreen', 'The exam runs in fullscreen. If you leave fullscreen, the question is hidden until you return.'],
  [ShieldAlert, 'Avoid switching away', 'Leaving fullscreen, switching tabs, copying, printing, or opening a second window is recorded as an integrity warning. The third warning submits your exam automatically.'],
  [ShieldAlert, 'Do not take screenshots', 'Screenshot attempts are recorded for review. The browser cannot stop an operating-system screenshot, so keep phones and other capture tools away. A second window or second device also counts as a warning.'],
];

/** /exam — gate (S3) first, then the runner (S4). Entering the route never proves the exam is active. */
export default function Exam() {
  const nav = useNavigate();
  const [phase, setPhase] = useState('checking'); // checking | ready | starting | blocked | running
  const [step, setStep] = useState('');
  const [error, setError] = useState(null); // {title, body, retry?, back?}
  const [entryError, setEntryError] = useState(null);
  const [initial, setInitial] = useState(null);
  const [event, setEvent] = useState(null);
  const [lockInfo, setLockInfo] = useState(null);
  const [health, setHealth] = useState({ state: 'checking' });
  const [seb, setSeb] = useState(() => ({ state: 'checking', inSeb: isSebBrowser(), required: false, configured: false }));
  const [serverOffset, setServerOffset] = useState(0);
  const [now, setNow] = useState(() => Date.now());

  const leaveFullscreen = () => { if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {}); };

  const checkHealth = useCallback(async () => {
    setHealth({ state: 'checking' });
    try { await api('/health'); setHealth({ state: 'ok' }); }
    catch (e) { setHealth({ state: 'error', message: e.message }); }
  }, []);

  useEffect(() => { checkHealth(); }, [checkHealth]);
  useEffect(() => {
    let alive = true;
    api('/seb/status')
      .then((r) => { if (alive) setSeb({ state: 'ok', inSeb: isSebBrowser(), ...r }); })
      .catch((e) => { if (alive) setSeb((s) => ({ ...s, state: 'error', error: e.message })); });
    return () => { alive = false; };
  }, []);
  useEffect(() => {
    if (phase !== 'ready') return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [phase]);

  const inSeb = seb.inSeb;
  const sebRequired = seb.state === 'ok' && seb.required;
  const sebUnavailable = sebRequired && !seb.configured;
  const sebBlocked = sebRequired && seb.configured && !inSeb;
  const fullscreenSupported = inSeb || (typeof document !== 'undefined' && !!document.documentElement.requestFullscreen);
  const stepOrder = inSeb ? ['paper'] : ['fullscreen', 'paper'];
  const serverNow = now + serverOffset;
  const startsAt = event ? Date.parse(event.starts_at) : NaN;
  const eventEndsAt = event ? Date.parse(event.ends_at) : NaN;
  const beforeStart = Number.isFinite(startsAt) && serverNow < startsAt;
  const windowEnded = Number.isFinite(eventEndsAt) && serverNow >= eventEndsAt;
  const paperTime = event?.paper_minutes
    ? event.min_paper_minutes && event.min_paper_minutes !== event.paper_minutes
      ? `${fmtDuration(event.min_paper_minutes)} - ${fmtDuration(event.paper_minutes)}`
      : fmtDuration(event.paper_minutes)
    : null;
  const exitToSignIn = () => { auth.clear('student'); nav('/', { replace: true }); };

  // An integrity lockout: the exam is over, the student is signed out.
  const lockOut = useCallback((info) => {
    leaveFullscreen();
    rememberLockNotice(info);
    auth.clear('student');
    setLockInfo(info || {});
    setPhase('locked');
  }, []);

  // Pre-check with the server: already submitted? no event?
  useEffect(() => {
    let alive = true;
    api('/student/event', { role: 'student' }).then((r) => {
      if (!alive) return;
      if (r.locked) { lockOut({ reason: r.lock_reason, label: r.lock_reason }); return; }
      if (r.submitted) { nav('/result', { replace: true }); return; }
      setEvent(r.event);
      setServerOffset(Date.parse(r.server_time) - Date.now());
      setNow(Date.now());
      setPhase('ready');
    }).catch((e) => {
      if (!alive) return;
      if (e.status === 403 && e.data?.code === 'removed') {
        auth.clear('student');
        setError({ title: 'Your access to this exam was removed.', body: e.message || 'Contact the exam team if you think this is a mistake.', back: true });
      } else if (e.status === 404) {
        setError({ title: "We couldn't find an active exam for this sign-in.", back: true });
      } else {
        setError({ title: 'Could not check your exam.', body: e.message, retry: () => window.location.reload() });
      }
      setPhase('blocked');
    });
    return () => { alive = false; };
  }, [lockOut, nav]);

  const begin = async () => {
    if (sebBlocked) {
      setEntryError({ title: 'Safe Exam Browser is required', body: 'Download and open the exam configuration before starting. This window cannot start the exam.', seb: true });
      return;
    }
    if (sebUnavailable) {
      setEntryError({ title: 'Safe Exam Browser is not configured', body: 'The exam team has not finished setting up Safe Exam Browser. Contact them before the exam starts.' });
      return;
    }
    if (beforeStart || windowEnded) return;
    setError(null); setEntryError(null); setPhase('starting');
    // 1. Fullscreen must come from this click (user gesture). SEB already
    // runs as a kiosk, so the Fullscreen API is not requested inside it.
    if (!inSeb) {
      setStep('fullscreen');
      try { await document.documentElement.requestFullscreen(); } catch {
        setPhase('ready');
        setEntryError({ title: 'Fullscreen is required', body: 'Your browser did not allow fullscreen. Allow fullscreen for this site, then try again. The exam cannot start until fullscreen is on.' });
        return;
      }
    }
    // 2. Load or resume the paper from the server. The domains chosen in the
    //    waiting room travel with the request; the server validates them again.
    setStep('paper');
    let r;
    try {
      r = await api('/exam/start', { method: 'POST', role: 'student', body: { domains: readDomainSelection(event?.id) } });
    } catch (e) {
      leaveFullscreen();
      setPhase('blocked');
      if (e.status === 409 && e.data?.code === 'not_started') setError({ title: 'The exam has not started yet.', body: 'Return to the waiting room.', waiting: true });
      else if (e.status === 409) setError({ title: e.message, back: true });
      else if (e.status === 403 && e.data?.code === 'removed') { auth.clear('student'); setError({ title: 'Your access to this exam was removed.', body: e.message || 'Contact the exam team if you think this is a mistake.', back: true }); }
      else if (e.status === 403 && e.data?.code === 'seb_required') setError({ title: 'Safe Exam Browser is required', body: e.data?.error || 'Download and open the exam configuration, then try again.', seb: true });
      else if (e.status === 503 && e.data?.code === 'seb_not_configured') setError({ title: 'Safe Exam Browser is not configured', body: e.data?.error || 'The exam team has not finished setting up Safe Exam Browser.' });
      else if (e.status === 400 && e.data?.code === 'domains_required') setError({ title: 'Choose your technical domains first.', body: e.data?.error || 'Return to the waiting room and choose the domains this exam asks for.', waiting: true });
      else if (e.status === 400 && e.data?.code) setError({ title: 'Your domain selection was refused.', body: e.data?.error || 'Return to the waiting room and choose again.', waiting: true });
      else setError({ title: 'Could not load your paper.', body: e.message, retry: begin });
      return;
    }
    if (r.status === 'submitted') {
      leaveFullscreen();
      if (r.locked) { lockOut({ reason: r.lock_reason, label: r.lock_reason }); return; }
      nav('/result', { replace: true });
      return;
    }
    if (r.status === 'insufficient') {
      leaveFullscreen();
      setPhase('blocked'); setError({ title: "This exam doesn't have enough questions configured to start.", body: 'Please contact the exam team. Your attempt has not been started.', back: true });
      return;
    }
    setInitial(r); setPhase('running');
  };

  const done = useCallback(() => {
    if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {});
    nav('/result', { replace: true });
  }, [nav]);

  if (phase === 'locked') return <Locked notice={lockInfo} />;
  if (phase === 'running' && initial) return <Runner initial={initial} onDone={done} onLocked={lockOut} eventName={event?.name} sebMode={inSeb} />;

  const at = stepOrder.indexOf(step);
  const healthLabel = health.state === 'ok' ? 'Online' : health.state === 'error' ? 'Unavailable' : 'Checking';
  const healthTone = health.state === 'ok' ? 'bg-ok-soft text-ok-ink' : health.state === 'error' ? 'bg-danger-soft text-danger-ink' : 'bg-slate-100 text-slate-500';
  const sebLabel = inSeb ? 'Detected' : sebRequired ? (sebUnavailable ? 'Not configured' : 'Required') : seb.state === 'error' ? 'Unknown' : 'Not required';
  const sebTone = inSeb ? 'bg-ok-soft text-ok-ink' : sebRequired ? 'bg-warn-soft text-warn-ink' : 'bg-slate-100 text-slate-500';
  const fsLabel = fullscreenSupported ? (inSeb ? 'SEB kiosk' : 'Supported') : 'Unavailable';
  const fsTone = fullscreenSupported ? 'bg-ok-soft text-ok-ink' : 'bg-warn-soft text-warn-ink';

  return (
    <div className="relative isolate grid min-h-screen place-items-center overflow-hidden px-4 py-10">
      <Aurora />
      <div className="w-full max-w-lg">
        <Reveal className="mb-6 flex justify-center"><Logo /></Reveal>
        <motion.div layout transition={{ duration: 0.4 }} className="er-glass overflow-hidden rounded-3xl p-7">
          <AnimatePresence mode="wait" initial={false}>
            {phase === 'checking' && (
              <motion.p key="c" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2 text-sm text-muted" role="status"><Spinner />Checking exam availability…</motion.p>
            )}

            {phase === 'ready' && event && (
              <Stagger key="r" className="space-y-5">
                <Item>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-soft px-3 py-1 text-xs font-medium text-primary"><ShieldCheck size={13} aria-hidden />Secure exam mode</span>
                  <h1 className="mt-3 text-2xl font-semibold tracking-tight">Ready to begin?</h1>
                  <p className="mt-1 text-muted">{event.name}</p>
                  <p className="mt-1 text-xs text-muted">
                    {fmtDateTime(event.starts_at)} <span aria-hidden>&middot;</span> Window {fmtDuration(event.duration_min)}
                    {paperTime && <> <span aria-hidden>&middot;</span> Paper {paperTime}</>}
                  </p>
                </Item>

                {beforeStart && (
                  <Banner tone="info" title="This exam has not started yet." action={<Button size="sm" variant="secondary" onClick={() => nav('/waiting')}>Waiting room</Button>}>
                    The start time is {fmtDateTime(event.starts_at)}. The exam cannot be started before then.
                  </Banner>
                )}
                {windowEnded && (
                  <Banner tone="warn" title="The exam window has closed." action={<Button size="sm" variant="secondary" onClick={exitToSignIn}>Back to sign in</Button>}>
                    This attempt can no longer be started. Contact your exam team if you think this is a mistake.
                  </Banner>
                )}
                {sebBlocked && (
                  <Banner tone="info" title="Open this exam in Safe Exam Browser" action={<Button size="sm" onClick={() => nav(SEB_HELP_PATH)}>SEB setup</Button>}>
                    This browser can sign in and wait, but the exam starts only inside Safe Exam Browser.
                  </Banner>
                )}
                {sebUnavailable && (
                  <Banner tone="error" title="Safe Exam Browser is not ready">
                    The exam team has not finished setting up the Safe Exam Browser configuration. Contact them before the exam starts.
                  </Banner>
                )}
                {seb.state === 'error' && (
                  <Banner tone="warn" title="Could not confirm the Safe Exam Browser requirement">
                    {seb.error} The server will still enforce it when you begin.
                  </Banner>
                )}
                {health.state === 'error' && (
                  <Banner tone="warn" title="The exam server is not reachable." action={<Button size="sm" variant="secondary" onClick={checkHealth}>Retry</Button>}>
                    {health.message} Do not begin until the connection is restored.
                  </Banner>
                )}

                <ul className="space-y-2.5 text-sm">
                  {RULES.map(([Icon, title, text]) => (
                    <Item as="li" key={title} className="flex gap-3 rounded-2xl border border-line/70 bg-white/70 px-3.5 py-3">
                      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary"><Icon size={16} aria-hidden /></span>
                      <span className="pt-0.5"><span className="font-medium text-ink">{title}</span><span className="mt-0.5 block text-muted">{text}</span></span>
                    </Item>
                  ))}
                </ul>

                {event.instructions && (
                  <Item className="rounded-2xl border border-blue-100 bg-primary-soft/60 px-4 py-3">
                    <p className="text-sm font-medium text-ink">Instructions from your exam team</p>
                    <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-body">{event.instructions}</p>
                  </Item>
                )}

                <Item className="flex flex-wrap gap-2 text-xs">
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-medium ${healthTone}`}>Server · {healthLabel}</span>
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-medium ${sebTone}`}>SEB · {sebLabel}</span>
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-medium ${fsTone}`}>Fullscreen · {fsLabel}</span>
                </Item>

                {entryError && <Item><Banner tone="error" title={entryError.title}>{entryError.body}</Banner></Item>}

                <Item>
                  <GlowButton className="h-12 w-full text-base" onClick={begin} disabled={beforeStart || windowEnded || sebBlocked || sebUnavailable || !fullscreenSupported}>
                    {inSeb ? <ShieldCheck size={16} aria-hidden /> : <Maximize size={16} aria-hidden />}
                    {inSeb ? 'Begin exam' : 'Enter fullscreen & begin'}
                  </GlowButton>
                </Item>
                <Item as="p" className="text-xs text-muted">
                  {!fullscreenSupported
                    ? 'This browser does not support fullscreen. Try a different browser.'
                    : inSeb
                      ? 'Safe Exam Browser is detected. The exam opens inside its secure window.'
                      : 'You will enter fullscreen to begin the exam.'}
                </Item>
              </Stagger>
            )}

            {phase === 'starting' && (
              <motion.div key="s" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-5" role="status" aria-live="polite">
                <p className="flex items-center gap-2 text-lg font-semibold"><Spinner />{STEPS[step]}</p>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <motion.div className="h-full rounded-full bg-gradient-to-r from-blue-600 to-sky-400" initial={{ width: '5%' }} animate={{ width: `${((at + 1) / stepOrder.length) * 100}%` }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }} />
                </div>
                <ol className="space-y-2">
                  {stepOrder.map((key, idx) => {
                    const label = (STEP_LIST.find(([k]) => k === key) || [key, key])[1];
                    const Icon = (STEP_LIST.find(([k]) => k === key) || [key, key, ShieldCheck])[2];
                    const done = at > idx, cur = at === idx;
                    return (
                      <li key={key} className="flex items-center gap-3 text-sm">
                        <span className={'grid h-7 w-7 place-items-center rounded-full ' + (done ? 'bg-ok-soft text-ok' : cur ? 'bg-primary-soft text-primary' : 'bg-slate-100 text-slate-400')}>
                          {done ? <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}><Check size={14} aria-hidden /></motion.span> : <Icon size={14} aria-hidden />}
                        </span>
                        <span className={cur ? 'font-medium' : done ? 'text-muted' : 'text-slate-400'}>{label}</span>
                      </li>
                    );
                  })}
                </ol>
              </motion.div>
            )}

            {phase === 'blocked' && error && (
              <motion.div key="b" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
                <Banner tone="error" title={error.title}>{error.body}</Banner>
                <div className="flex flex-wrap gap-2">
                  {error.retry && <Button onClick={error.retry}>Try again</Button>}
                  {error.seb && <Button onClick={() => nav(SEB_HELP_PATH)}>Open SEB setup</Button>}
                  {error.waiting && <Button onClick={() => nav('/waiting')}>Back to waiting room</Button>}
                  {error.back && <Button variant="secondary" onClick={() => nav('/')}>Back to sign in</Button>}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
