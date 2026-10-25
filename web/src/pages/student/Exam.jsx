import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, BookOpenCheck, Check, CircleAlert, Clock, CalendarDays, Maximize, RefreshCw, ShieldCheck, Wifi, WifiOff } from 'lucide-react';
import { api, auth } from '../../lib/api.js';
// Screen sharing and recording are disabled for now. Keep the recorder module
// for when the feature is turned back on.
// import { ScreenRecorder } from '../../lib/recorder.js';
import { Banner, Button, Card, Spinner, cx } from '../../components/ui.jsx';
// import { RecordingChip } from '../../components/exam/parts.jsx';
import Runner from '../../components/exam/Runner.jsx';
import { StudentHeader } from '../../components/StudentShell.jsx';
import Locked, { rememberLockNotice } from './Locked.jsx';
import { readDomainSelection } from '../../lib/domains.js';
import { fmtDateTime, fmtDuration } from '../../lib/format.js';
import { SEB_HELP_PATH, isSebBrowser } from '../../lib/seb.js';

const STEPS = { fullscreen: 'Requesting fullscreen…', paper: 'Loading your paper…' };
const STEP_ORDER = ['fullscreen', 'paper'];
// Screen recording is disabled for now.
// const STEPS = { fullscreen: 'Requesting fullscreen…', paper: 'Loading your paper…', recording: 'Preparing screen recording…' };
// const STEP_ORDER = ['fullscreen', 'paper', 'recording'];
const RULES = [
  ['Start in Safe Exam Browser', 'The exam opens only in Safe Exam Browser on Windows. You can sign in and wait in your normal browser, but starting the exam requires SEB.'],
  ['Stay in fullscreen', 'The exam runs in fullscreen. If you leave fullscreen, the question is hidden until you return.'],
  ['Avoid switching away', 'Leaving fullscreen, switching tabs, copying, printing, or opening a second window is recorded as an integrity warning. Warnings are reviewed by the exam team; they do not end the exam automatically.'],
  ['Do not take screenshots', 'Screenshot attempts are recorded for review. The browser cannot stop an operating-system screenshot, so keep phones and other capture tools away. A second window or second device also counts as a warning.'],
  // ['Your screen is recorded', 'Your entire screen is recorded for the duration of the exam. A browser cannot block an operating-system screenshot, so captures are reviewed from the recording.'],
];

const ROW_TONES = {
  ok: 'bg-ok-soft text-ok-ink',
  warn: 'bg-warn-soft text-warn-ink',
  danger: 'bg-danger-soft text-danger-ink',
  info: 'bg-primary-soft text-primary',
  neutral: 'bg-slate-100 text-slate-500',
};

function ReadinessRow({ icon: Icon, title, children, tone = 'neutral', status }) {
  return (
    <li className="flex items-start gap-3 py-3.5">
      <span className={cx('grid h-9 w-9 shrink-0 place-items-center rounded-lg', ROW_TONES[tone])}><Icon size={16} aria-hidden /></span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-body">{title}</p>
        {children && <div className="mt-0.5 text-xs leading-5 text-muted">{children}</div>}
      </div>
      {status && <span className={cx('mt-1 inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[11px] font-medium', ROW_TONES[tone])}>{status}</span>}
    </li>
  );
}

/** /exam — gate (S3) first, then the runner (S4). Entering the route never proves the exam is active. */
export default function Exam() {
  const nav = useNavigate();
  const [phase, setPhase] = useState('checking'); // checking | ready | starting | blocked | running
  const [step, setStep] = useState('');
  const [error, setError] = useState(null); // {title, body, retry?, back?}
  const [initial, setInitial] = useState(null);
  // Screen sharing and recording are disabled for now.
  // const [rec, setRec] = useState({ status: 'idle', uploaded: 0, pending: 0, retrying: false, error: null });
  // const [shareError, setShareError] = useState(null); // {title, body}
  // const [sharing, setSharing] = useState(false);
  // const sharingRef = useRef(false);
  // const recorder = useRef(null);
  // if (!recorder.current) recorder.current = new ScreenRecorder(setRec);
  const [entryError, setEntryError] = useState(null); // {title, body}
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
  const stepOrder = inSeb ? ['paper'] : STEP_ORDER;
  const serverNow = now + serverOffset;
  const startsAt = event ? Date.parse(event.starts_at) : NaN;
  const eventEndsAt = event ? Date.parse(event.ends_at) : NaN;
  const beforeStart = Number.isFinite(startsAt) && serverNow < startsAt;
  const windowEnded = Number.isFinite(eventEndsAt) && serverNow >= eventEndsAt;
  const exitToSignIn = () => { auth.clear('student'); nav('/', { replace: true }); };

  // An integrity lockout: the exam is over, the student is signed out.
  const lockOut = useCallback((info) => {
    // recorder.current?.stop();
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
      setError(e.status === 404 ? { title: "We couldn't find an active exam for this sign-in.", back: true } : { title: 'Could not check your exam.', body: e.message, retry: () => window.location.reload() });
      setPhase('blocked');
    });
    return () => { alive = false; };
  }, [lockOut, nav]);

  // Screen sharing and recording are disabled for now.
  // useEffect(() => () => { recorder.current?.stop(); }, []);
  //
  // const shareScreen = async () => {
  //   if (sharingRef.current || beforeStart || windowEnded) return;
  //   sharingRef.current = true;
  //   setSharing(true);
  //   setShareError(null);
  //   setError(null);
  //   setPhase('ready');
  //   try {
  //     const ok = await recorder.current.prepare();
  //     if (!ok) setShareError({ title: 'Screen sharing is required', body: recorder.current.state.error || 'Screen sharing could not start. Share your entire screen to begin.' });
  //   } finally {
  //     sharingRef.current = false;
  //     setSharing(false);
  //   }
  // };

  const begin = async () => {
    if (sebBlocked) {
      setEntryError({ title: 'Safe Exam Browser is required', body: 'Download and open the exam configuration before starting. This window cannot start the exam.', seb: true });
      return;
    }
    if (sebUnavailable) {
      setEntryError({ title: 'Safe Exam Browser is not configured', body: 'The exam team has not finished setting up Safe Exam Browser. Contact them before the exam starts.' });
      return;
    }
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
    // 2. Load or resume the paper from the server.
    setStep('paper');
    let r;
    try {
      // A domain-aware event needs the domains the student chose in the
      // waiting room. The server validates the selection again.
      r = await api('/exam/start', { method: 'POST', role: 'student', body: { domains: readDomainSelection() } });
    } catch (e) {
      leaveFullscreen();
      setPhase('blocked');
      if (e.status === 409 && e.data?.code === 'not_started') setError({ title: 'The exam has not started yet.', body: 'Return to the waiting room.', waiting: true });
      else if (e.status === 409) setError({ title: e.message, back: true });
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
    // Screen recording is disabled for now.
    // setStep('recording');
    // await recorder.current.start();
    setInitial(r); setPhase('running');
  };

  const done = useCallback(() => {
    if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {});
    nav('/result', { replace: true });
  }, [nav]);

  if (phase === 'locked') return <Locked notice={lockInfo} />;
  if (phase === 'running' && initial) return <Runner initial={initial} onDone={done} onLocked={lockOut} eventName={event?.name} sebMode={inSeb} />;

  const healthTone = health.state === 'ok' ? 'ok' : health.state === 'error' ? 'danger' : 'neutral';
  const healthStatus = health.state === 'ok' ? 'Online' : health.state === 'error' ? 'Unavailable' : 'Checking';
  return (
    <div className="min-h-screen bg-bg">
      <StudentHeader wide />
      <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
        {phase === 'checking' && (
          <Card className="mx-auto max-w-xl p-6 sm:p-8">
            <p className="flex items-center gap-2 text-sm text-muted" role="status"><Spinner size={18} />Checking exam availability…</p>
          </Card>
        )}

        {phase === 'starting' && (
          <Card className="mx-auto max-w-xl p-6 sm:p-8">
            <div className="space-y-5" role="status" aria-live="polite">
              <div><h1 className="text-xl font-semibold tracking-tight">Preparing your exam</h1><p className="mt-1 text-sm text-muted">{STEPS[step]}</p></div>
              <div className="h-1.5 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-primary transition-all" style={{ width: `${((stepOrder.indexOf(step) + 1) / stepOrder.length) * 100}%` }} /></div>
              <ul className="space-y-2.5">
                {stepOrder.map((key) => {
                  const current = step === key;
                  const complete = stepOrder.indexOf(key) < stepOrder.indexOf(step);
                  return (
                    <li key={key} className="flex items-center gap-2.5 text-sm">
                      <span className={cx('grid h-6 w-6 place-items-center rounded-full border', complete ? 'border-ok bg-ok-soft text-ok-ink' : current ? 'border-primary text-primary' : 'border-line text-muted/60')}>
                        {complete ? <Check size={13} aria-hidden /> : current ? <Spinner size={12} /> : <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden />}
                      </span>
                      <span className={current ? 'font-medium text-ink' : complete ? 'text-body' : 'text-muted'}>{STEPS[key]}</span>
                    </li>
                  );
                })}
              </ul>
              <p className="text-xs text-muted">Keep this window open while your exam starts.</p>
            </div>
          </Card>
        )}

        {phase === 'blocked' && error && (
          <Card className="mx-auto max-w-xl p-6 sm:p-8">
            <div className="space-y-4">
              <span className="grid h-11 w-11 place-items-center rounded-full bg-danger-soft text-danger-ink"><CircleAlert size={21} aria-hidden /></span>
              <Banner tone="error" title={error.title}>{error.body}</Banner>
              <div className="flex flex-wrap gap-2">
                {error.retry && <Button onClick={error.retry}>Try again</Button>}
                {error.seb && <Button onClick={() => nav(SEB_HELP_PATH)}>Open SEB setup</Button>}
                {error.waiting && <Button onClick={() => nav('/waiting')}>Back to waiting room</Button>}
                {error.back && <Button variant="secondary" onClick={() => nav('/')}>Back to sign in</Button>}
              </div>
            </div>
          </Card>
        )}

        {phase === 'ready' && event && (
          <div>
            <div className="mb-6">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Exam instructions</p>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">{event.name}</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">Review the rules and confirm that your browser is ready before you begin.</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-2 rounded-md border border-line bg-white px-3 py-1.5 text-xs text-muted"><CalendarDays size={14} className="text-primary" aria-hidden /><span className="font-medium text-body">{fmtDateTime(event.starts_at)}</span></span>
                <span className="inline-flex items-center gap-2 rounded-md border border-line bg-white px-3 py-1.5 text-xs text-muted"><Clock size={14} className="text-primary" aria-hidden /><span className="font-medium text-body">{fmtDuration(event.duration_min)}</span></span>
                <span className="inline-flex items-center gap-2 rounded-md border border-line bg-white px-3 py-1.5 text-xs text-muted"><ShieldCheck size={14} className="text-primary" aria-hidden />Proctored</span>
              </div>
            </div>

            {beforeStart && (
              <Banner tone="info" className="mb-5" title="This exam has not started yet." action={<Button size="sm" variant="secondary" onClick={() => nav('/waiting')}><ArrowLeft size={14} aria-hidden />Waiting room</Button>}>
                The start time is {fmtDateTime(event.starts_at)}. The exam cannot be started before then.
              </Banner>
            )}
            {windowEnded && (
              <Banner tone="warn" className="mb-5" title="The exam window has closed." action={<Button size="sm" variant="secondary" onClick={exitToSignIn}>Back to sign in</Button>}>
                This attempt can no longer be started. Contact your exam team if you think this is a mistake.
              </Banner>
            )}
            {sebBlocked && (
              <Banner tone="info" className="mb-5" title="Open this exam in Safe Exam Browser" action={<Button size="sm" onClick={() => nav(SEB_HELP_PATH)}>SEB setup</Button>}>
                This browser can sign in and wait, but the exam starts only inside Safe Exam Browser. Download the exam configuration and open the <span className="font-medium">exam.seb</span> file.
              </Banner>
            )}
            {sebUnavailable && (
              <Banner tone="error" className="mb-5" title="Safe Exam Browser is not ready">
                The exam team has not finished setting up the Safe Exam Browser configuration. Contact them before the exam starts.
              </Banner>
            )}
            {seb.state === 'error' && (
              <Banner tone="warn" className="mb-5" title="Could not confirm the Safe Exam Browser requirement">
                {seb.error} The server will still enforce it when you begin.
              </Banner>
            )}

            <div className="grid gap-5 lg:grid-cols-[minmax(0,1.55fr)_minmax(280px,1fr)]">
              <Card className="flex flex-col p-6 sm:p-8">
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-lg bg-primary-soft text-primary"><BookOpenCheck size={19} aria-hidden /></span>
                  <div><h2 className="text-lg font-semibold tracking-tight">Read instructions</h2><p className="text-sm text-muted">Please review each rule before starting.</p></div>
                </div>

                <ol className="mt-6 space-y-5">
                  {RULES.map(([title, text], i) => (
                    <li key={title} className="flex gap-3.5">
                      <span className="tnum grid h-7 w-7 shrink-0 place-items-center rounded-full border border-line bg-canvas text-xs font-semibold text-primary">{i + 1}</span>
                      <div><p className="text-sm font-medium text-ink">{title}</p><p className="mt-1 text-sm leading-6 text-muted">{text}</p></div>
                    </li>
                  ))}
                </ol>

                {event.instructions && (
                  <div className="mt-6 rounded-xl border border-line bg-primary-soft/50 p-4">
                    <p className="text-sm font-medium text-ink">Instructions from your exam team</p>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-body">{event.instructions}</p>
                  </div>
                )}

                <div className="mt-auto border-t border-line pt-6">
                  {entryError && <Banner tone="error" className="mb-3" title={entryError.title}>{entryError.body}</Banner>}
                  <Button size="lg" className="w-full sm:w-auto" onClick={begin} disabled={beforeStart || windowEnded || phase !== 'ready' || !fullscreenSupported || sebBlocked || sebUnavailable}>
                    {inSeb ? <ShieldCheck size={16} aria-hidden /> : <Maximize size={16} aria-hidden />}
                    {inSeb ? 'Begin exam' : 'Enter fullscreen & begin'}
                  </Button>
                  <p className="mt-2.5 text-xs leading-5 text-muted">
                    {inSeb ? 'Safe Exam Browser is detected. The exam opens inside its secure window.' : sebRequired ? 'You will enter fullscreen to begin the exam. The exam starts only in Safe Exam Browser.' : 'You will enter fullscreen to begin the exam.'}
                  </p>
                </div>
              </Card>

              <aside>
                <Card className="p-5 sm:p-6">
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="text-base font-semibold tracking-tight">Before you start</h2>
                    <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">Live checks</span>
                  </div>
                  <ul className="mt-2 divide-y divide-line">
                    <ReadinessRow icon={health.state === 'error' ? WifiOff : Wifi} title="Exam server" tone={healthTone} status={healthStatus}>
                      {health.state === 'checking' && 'Contacting the exam server.'}
                      {health.state === 'ok' && 'The server is reachable from this browser.'}
                      {health.state === 'error' && (
                        <span className="flex flex-wrap items-center gap-1.5">{health.message} <button type="button" onClick={checkHealth} className="inline-flex items-center gap-1 font-medium text-primary hover:underline"><RefreshCw size={11} aria-hidden />Retry</button></span>
                      )}
                    </ReadinessRow>
                    <ReadinessRow icon={ShieldCheck} title="Safe Exam Browser" tone={inSeb ? 'ok' : sebRequired ? 'warn' : 'neutral'} status={inSeb ? 'Detected' : sebRequired ? 'Required' : seb.state === 'error' ? 'Unknown' : 'Not required'}>
                      {inSeb
                        ? 'The exam is running inside Safe Exam Browser.'
                        : sebRequired
                          ? 'Open the exam through the SEB configuration file before starting.'
                          : seb.state === 'error'
                            ? 'The requirement could not be checked; the server will enforce it.'
                            : 'Safe Exam Browser is not required for this exam.'}
                    </ReadinessRow>
                    <ReadinessRow icon={Maximize} title={inSeb ? 'Kiosk mode' : 'Fullscreen'} tone={fullscreenSupported ? 'ok' : 'warn'} status={fullscreenSupported ? (inSeb ? 'SEB' : 'Supported') : 'Unavailable'}>
                      {fullscreenSupported ? (inSeb ? 'Safe Exam Browser provides the secure kiosk window.' : 'The exam will open in fullscreen.') : 'This browser does not support fullscreen. Try a different browser.'}
                    </ReadinessRow>
                    {/* Screen sharing and recording are disabled for now.
                    <ReadinessRow icon={Monitor} title="Screen sharing" tone={shareTone} status={shareStatus}>
                      {shareReady
                        ? 'Entire screen is shared. Enter fullscreen to begin.'
                        : shareFailed
                          ? 'Share your entire screen to continue.'
                          : displaySupported
                            ? 'Requested before fullscreen. Choose “Entire screen”.'
                            : 'This browser cannot share a screen. Try a different browser.'}
                    </ReadinessRow>
                    <ReadinessRow icon={Video} title="Screen recording" tone={recordingTone} status={null}>
                      {rec.status === 'idle' ? 'Starts after you share your entire screen and enter fullscreen.' : <RecordingChip rec={rec} />}
                    </ReadinessRow>
                    */}
                  </ul>
                  <p className="mt-2 rounded-lg bg-canvas px-3 py-2.5 text-xs leading-5 text-muted">A failed readiness check does not replace the exam rules. If you cannot meet them, contact your exam team before starting.</p>
                </Card>
              </aside>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
