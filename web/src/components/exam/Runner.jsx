import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, LayoutGrid, ShieldCheck, TriangleAlert } from 'lucide-react';
import { api, wsTicket, wsUrl } from '../../lib/api.js';
import { useIntegrity } from '../../hooks/useIntegrity.js';
import { KIND_LABELS, detectFullscreen } from '../../lib/integrity.js';
import { ConnectionBadge } from '../ConnectionBadge.jsx';
import { Badge, Banner, Button, Logo, Modal, Spinner, cx } from '../ui.jsx';
// RecordingChip is disabled with screen recording for now.
import { AnswerOption, AutosaveChip, ExamCountdown, FullscreenBlocker, ProctorWarningBanner, QuestionNavigator, QuestionNavigatorPanel, SubmitDialog } from './parts.jsx';

const queueKey = (paperId) => (paperId ? `examrobo:answers:${paperId}` : null);

function readQueue(paperId) {
  const key = queueKey(paperId);
  if (!key) return [];
  try {
    const list = JSON.parse(localStorage.getItem(key) || '[]');
    return Array.isArray(list) ? list.filter((item) => item?.qid && Number.isInteger(item.choice)) : [];
  } catch {
    return [];
  }
}

function writeQueue(paperId, pending) {
  const key = queueKey(paperId);
  if (!key) return;
  try {
    const list = [...pending].map(([qid, item]) => ({ qid, choice: item.choice, index: item.index }));
    localStorage.setItem(key, JSON.stringify(list));
  } catch {
    /* storage is unavailable */
  }
}

function clearQueue(paperId) {
  const key = queueKey(paperId);
  if (!key) return;
  try {
    localStorage.removeItem(key);
  } catch {
    /* storage is unavailable */
  }
}

/**
 * Exam runner. Everything authoritative (answers, warnings, deadline, status)
 * comes from the server; React state only mirrors it for display. The runner is
 * deliberately self-contained so admin-side changes cannot affect it.
 */
export default function Runner({ initial, onDone, onLocked, eventName, sebMode = false }) {
  const sections = initial.paper.sections;
  const flat = useMemo(() => sections.flatMap((s) => s.questions.map((q) => ({ ...q, section: s.name }))), [sections]);
  const total = flat.length;

  const paperId = initial.paper_id;
  const queued = useRef();
  if (queued.current === undefined) {
    queued.current = new Map(readQueue(paperId).map((item) => [item.qid, { choice: item.choice, index: item.index }]));
  }
  const [answers, setAnswers] = useState(() => {
    const merged = { ...(initial.answers || {}) };
    for (const [qid, item] of queued.current) merged[qid] = item.choice;
    return merged;
  });
  const [saveState, setSaveState] = useState({}); // qid -> saving | saved | failed
  const [index, setIndex] = useState(Math.min(initial.current_index || 0, Math.max(0, total - 1)));
  const [question, setQuestion] = useState(null);
  const [questionState, setQuestionState] = useState({ loading: true, error: '' });
  const questionCache = useRef(new Map());
  const questionSeq = useRef(0);
  const [warnings, setWarnings] = useState(initial.warnings || 0);
  const maxWarnings = initial.max_warnings || 3;
  const [warning, setWarning] = useState(null);
  const [endsAt, setEndsAt] = useState(initial.ends_at);
  const [serverTime, setServerTime] = useState(initial.server_time);
  const [offline, setOffline] = useState(false);
  const [wsUp, setWsUp] = useState(true);
  const [finished, setFinished] = useState(null); // {msg}
  const [navOpen, setNavOpen] = useState(false);
  const [submitOpen, setSubmitOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [proctorMsg, setProctorMsg] = useState(null);
  const [fullscreen, setFullscreen] = useState(() => sebMode || detectFullscreen());
  const [resultError, setResultError] = useState('');
  const isFullscreen = sebMode || fullscreen;

  const finishedRef = useRef(null);
  const indexRef = useRef(index);
  indexRef.current = index;
  const fullscreenRef = useRef(isFullscreen);
  fullscreenRef.current = isFullscreen;
  const versions = useRef({});

  /* ---- go to result once the server confirms submission ---- */
  const goResult = useCallback(async () => {
    let tries = 0;
    for (;;) {
      try {
        await api('/exam/result', { role: 'student' });
        onDone();
        return;
      } catch (e) {
        if (e.status === 409 && e.data?.code === 'active') {
          tries += 1;
          if (tries > 6) { // server says still active -> our clock was wrong; resume
            try {
              const r = await api('/exam/snapshot', { method: 'POST', role: 'student', body: { current_index: indexRef.current } });
              setEndsAt(r.ends_at); setServerTime(r.server_time);
              finishedRef.current = null; setFinished(null);
              return;
            } catch { /* keep polling */ }
          }
        } else if (e.status === 0 || e.status >= 500) {
          setResultError('Waiting for the server to confirm your submission…');
        } else if (e.status === 401) return;
        await new Promise((r) => setTimeout(r, 1000));
      }
    }
  }, [onDone]);

  const lock = useCallback((msg) => {
    if (finishedRef.current) return;
    finishedRef.current = { msg };
    queued.current.clear();
    clearQueue(paperId);
    setFinished({ msg });
    setSubmitOpen(false);
    goResult();
  }, [goResult, paperId]);

  // An integrity lockout ends the exam and signs the student out: the exam
  // goes to the lock screen instead of the result screen.
  const lockOut = useCallback((info) => {
    if (finishedRef.current) return;
    const payload = { msg: info?.msg || 'Your exam was ended because of an integrity violation.', ...info };
    finishedRef.current = payload;
    queued.current.clear();
    clearQueue(paperId);
    setFinished(payload);
    onLocked?.(payload);
  }, [onLocked, paperId]);

  // A 409 means the paper is no longer active. If the server locked it for an
  // integrity violation the student goes to the lock screen, not the result.
  const handleConflict = useCallback((e) => {
    if (e?.status !== 409) return false;
    if (e.data?.locked) {
      lockOut({
        msg: e.data.lock_reason ? `${e.data.lock_reason}.` : 'Your exam was ended because of an integrity violation.',
        label: e.data.lock_reason || null,
      });
      return true;
    }
    lock('Your exam has been submitted.');
    return true;
  }, [lock, lockOut]);

  const persistQueue = useCallback(() => writeQueue(paperId, queued.current), [paperId]);

  const flushQueue = useCallback(async () => {
    if (finishedRef.current) return;
    for (const [qid, item] of [...queued.current]) {
      try {
        await api('/exam/answer', {
          method: 'POST',
          role: 'student',
          body: { question_id: qid, choice: item.choice, index: item.index },
        });
        if (queued.current.get(qid)?.choice === item.choice) queued.current.delete(qid);
        persistQueue();
        setSaveState((s) => ({ ...s, [qid]: 'saved' }));
        setOffline(false);
      } catch (e) {
        if (handleConflict(e) || e.status === 401) return;
        if (e.status === 400) {
          queued.current.delete(qid);
          persistQueue();
          setSaveState((s) => ({ ...s, [qid]: 'failed' }));
          continue;
        }
        return;
      }
    }
  }, [handleConflict, persistQueue]);

  useEffect(() => {
    if (queued.current.size) flushQueue();
    const onOnline = () => { if (queued.current.size) flushQueue(); };
    window.addEventListener('online', onOnline);
    return () => window.removeEventListener('online', onOnline);
  }, [flushQueue]);

  /* ---- one question at a time: the manifest is all the runner has ---- */
  const loadQuestion = useCallback(async (n) => {
    if (finishedRef.current) return;
    const seq = ++questionSeq.current;
    const cached = questionCache.current.get(n);
    if (cached) {
      setQuestion(cached);
      setQuestionState({ loading: false, error: '' });
      return;
    }

    setQuestion(null);
    setQuestionState({ loading: true, error: '' });
    try {
      const r = await api(`/exam/question/${n}`, { role: 'student' });
      if (seq !== questionSeq.current) return;
      questionCache.current.set(n, r.question);
      setQuestion(r.question);
      setQuestionState({ loading: false, error: '' });
    } catch (e) {
      if (seq !== questionSeq.current) return;
      if (handleConflict(e)) return;
      setQuestionState({ loading: false, error: e.message || 'Could not load this question.' });
    }
  }, [handleConflict]);

  useEffect(() => {
    loadQuestion(index);
    return () => { questionSeq.current += 1; };
  }, [index, loadQuestion]);

  /* ---- autosave: POST immediately, retry on failure, latest write wins ---- */
  const save = useCallback(async (qid, choice, idx) => {
    const v = (versions.current[qid] = (versions.current[qid] || 0) + 1);
    queued.current.set(qid, { choice, index: idx });
    persistQueue();
    setSaveState((s) => ({ ...s, [qid]: 'saving' }));
    let wait = 1000;
    while (versions.current[qid] === v && !finishedRef.current) {
      try {
        await api('/exam/answer', { method: 'POST', role: 'student', body: { question_id: qid, choice, index: idx } });
        if (queued.current.get(qid)?.choice === choice) {
          queued.current.delete(qid);
          persistQueue();
        }
        if (versions.current[qid] === v) setSaveState((s) => ({ ...s, [qid]: 'saved' }));
        setOffline(false);
        return;
      } catch (e) {
        if (handleConflict(e)) return;
        if (e.status === 401) return;
        if (e.status === 400) {
          queued.current.delete(qid);
          persistQueue();
          setSaveState((s) => ({ ...s, [qid]: 'failed' }));
          return;
        }
        setSaveState((s) => ({ ...s, [qid]: 'failed' }));
        if (e.status === 0) setOffline(true);
        await new Promise((r) => setTimeout(r, wait));
        wait = Math.min(wait * 2, 8000);
      }
    }
  }, [handleConflict, persistQueue]);

  const choose = (q, choice) => {
    if (finishedRef.current) return;
    setAnswers((a) => ({ ...a, [q.id]: choice }));
    save(q.id, choice, indexRef.current);
  };

  const aggregate = Object.values(saveState).includes('failed') ? 'failed' : Object.values(saveState).includes('saving') ? 'saving' : 'saved';

  /* ---- 15 s snapshot (also re-anchors the clock to the server) ---- */
  useEffect(() => {
    const t = setInterval(async () => {
      if (finishedRef.current) return;
      try {
        const r = await api('/exam/snapshot', { method: 'POST', role: 'student', body: { current_index: indexRef.current, fullscreen: fullscreenRef.current } });
        setEndsAt(r.ends_at); setServerTime(r.server_time); setWarnings(r.warnings); setOffline(false);
        // The server can end the exam from its own side (the fullscreen
        // backstop, the warning limit). The heartbeat is how the client hears
        // about it when the websocket is down.
        if (r.submitted) lock('Your exam has been submitted.');
      } catch (e) {
        if (handleConflict(e)) return;
        if (e.status === 0) setOffline(true);
      }
    }, 15000);
    return () => clearInterval(t);
  }, [handleConflict, lock]);

  /* ---- persist question position shortly after navigation ---- */
  useEffect(() => {
    const t = setTimeout(() => { if (!finishedRef.current) api('/exam/snapshot', { method: 'POST', role: 'student', body: { current_index: index, fullscreen: fullscreenRef.current } }).catch(() => {}); }, 800);
    return () => clearTimeout(t);
  }, [index]);

  /* ---- proctor events: report to server; server owns the count ---- */
  const report = useCallback(async (kind, reason) => {
    if (finishedRef.current) return;
    // The banner shows the policy label, not the raw detail the guard
    // produced ("Blocked copy."). The detail is for the proctor log.
    const label = KIND_LABELS[kind] || reason || kind;
    setWarning((w) => ({ count: w?.count ?? warnings, max: maxWarnings, reason: label, final: false, pending: true }));
    for (let attempt = 0; attempt < 4; attempt++) {
      try {
        const r = await api('/exam/event', { method: 'POST', role: 'student', body: { kind, detail: reason || '' } });
        setWarnings(r.warnings);
        setWarning({ count: r.warnings, max: r.max_warnings, reason: label, final: r.submitted, locked: r.locked });
        if (r.locked) {
          lockOut({ msg: r.reason || 'Your exam was ended because of an integrity violation.', label: r.label, kind });
          return;
        }
        if (r.submitted) lock('Your exam has been submitted.');
        return;
      } catch (e) {
        if (handleConflict(e)) return;
        await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
      }
    }
  }, [handleConflict, lock, lockOut, maxWarnings, warnings]);

  /* ---- browser guards: clipboard, print, screenshot keys, tab, fullscreen ---- */
  useIntegrity({
    onViolation: report,
    onFullscreenChange: setFullscreen,
  });

  /* ---- websocket: proctor messages and force-submit; refetch state on reconnect ---- */
  useEffect(() => {
    let ws, retry, closed = false, wait = 1000, wasDown = false;
    const open = async () => {
      if (closed) return;
      try {
        const ticket = await wsTicket('student');
        if (closed) return;
        ws = new WebSocket(wsUrl(ticket));
      } catch {
        if (closed) return;
        wasDown = true; setWsUp(false);
        retry = setTimeout(open, wait); wait = Math.min(wait * 2, 10000);
        return;
      }
      ws.onopen = async () => {
        wait = 1000; setWsUp(true);
        if (wasDown) { // reconcile with REST state after a drop
          try {
            const r = await api('/exam/snapshot', { method: 'POST', role: 'student', body: { current_index: indexRef.current, fullscreen: fullscreenRef.current } });
            setEndsAt(r.ends_at); setServerTime(r.server_time); setWarnings(r.warnings);
          } catch (e) { handleConflict(e); }
        }
      };
      ws.onmessage = (ev) => {
        let m; try { m = JSON.parse(ev.data); } catch { return; }
        if (m.type === 'message') setProctorMsg(m);
        if (m.type === 'locked') {
          lockOut({ msg: m.reason || 'Your exam was ended because of an integrity violation.', label: m.label, kind: m.kind });
          return;
        }
        if (m.type === 'submitted') {
          if (m.reason === 'integrity_lockout') {
            lockOut({ msg: 'Your exam was ended because of an integrity violation.' });
            return;
          }
          lock(m.reason === 'force_submit' ? 'Your exam has been submitted by the exam team.' : 'Your exam has been submitted.');
        }
      };
      ws.onclose = () => { if (closed) return; wasDown = true; setWsUp(false); retry = setTimeout(open, wait); wait = Math.min(wait * 2, 10000); };
    };
    open();
    return () => { closed = true; clearTimeout(retry); ws?.close(); };
  }, [handleConflict, lock, lockOut]);

  /* ---- expiry: the server decides; the anchored clock only asks for the result ---- */
  const onExpire = useCallback(() => {
    if (finishedRef.current) return;
    lock('Time is up. Your exam is being submitted.');
  }, [lock]);

  const submit = async () => {
    setSubmitting(true); setSubmitError('');
    try {
      await flushQueue();
      if (queued.current.size) {
        setSubmitError('Some answers are still not saved. Stay online and try again before submitting.');
        return;
      }
      await api('/exam/submit', { method: 'POST', role: 'student' });
      queued.current.clear();
      clearQueue(paperId);
      finishedRef.current = { msg: 'Submitting…' };
      setFinished({ msg: 'Your exam has been submitted.' });
      setSubmitOpen(false);
      goResult();
    } catch (e) {
      setSubmitError(e.status === 0 ? 'Could not reach the server. Your exam has NOT been submitted — try again.' : e.message);
    } finally { setSubmitting(false); }
  };

  const returnFullscreen = () => { if (!sebMode) document.documentElement.requestFullscreen?.().catch(() => {}); };

  const qMeta = flat[index] || null;
  const answered = Object.keys(answers).length;
  const locked = !!finished;
  // The exam is paused outside fullscreen: the question is not rendered at
  // all, so it cannot be read off the screen while the warning is counted.
  const blocked = !isFullscreen && !locked;
  const navigationDisabled = locked || blocked;
  const sectionStats = sections.map((s) => ({
    name: s.name,
    total: s.questions.length,
    answered: s.questions.filter((item) => answers[item.id] !== undefined).length,
    first: s.questions[0]?.n ?? 0,
    active: s.name === qMeta?.section,
  }));

  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <header className="sticky top-0 z-30 border-b border-line bg-white/95 backdrop-blur">
        <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6">
          <div className="flex items-center gap-3 py-2.5">
            <Logo className="shrink-0 text-sm" />
            <span className="hidden h-6 w-px bg-line md:block" aria-hidden />
            <div className="hidden min-w-0 flex-1 md:block">
              <p className="truncate text-sm font-medium text-ink">{eventName || 'Exam session'}</p>
              <p className="text-[11px] text-muted"><span className="tnum">Question {index + 1} of {total}</span><span className="mx-1.5 text-line" aria-hidden>·</span>{qMeta?.section}</p>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <div className="hidden items-center gap-2 md:flex">
                <ConnectionBadge />
                <Badge tone={warnings >= maxWarnings ? 'danger' : warnings ? 'warn' : 'neutral'}><span className="tnum">Warnings {warnings}</span></Badge>
                <AutosaveChip state={aggregate} />
                {/* Screen recording is disabled for now. <RecordingChip rec={recorder} /> */}
              </div>
              <ExamCountdown endsAt={endsAt} serverTime={serverTime} onExpire={onExpire} />
            </div>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:hidden">
            <span className="whitespace-nowrap text-xs font-medium text-ink"><span className="tnum">Q {index + 1} / {total}</span><span className="mx-1.5 text-line" aria-hidden>·</span><span className="text-muted">{qMeta?.section}</span></span>
            <ConnectionBadge />
            <Badge tone={warnings >= maxWarnings ? 'danger' : warnings ? 'warn' : 'neutral'}><span className="tnum">Warnings {warnings}</span></Badge>
            <AutosaveChip state={aggregate} />
            {/* Screen recording is disabled for now. <span className="hidden sm:inline-flex"><RecordingChip rec={recorder} /></span> */}
          </div>
        </div>
      </header>

      <div className="mx-auto w-full max-w-[1440px] px-4 pt-3 sm:px-6">
        <div className="flex flex-col gap-2 empty:hidden">
          {offline && <Banner tone="warn" className="mx-auto w-full max-w-3xl">Connection lost. Reconnecting… Your exam time continues to follow the server timer.</Banner>}
          {!wsUp && !offline && <Banner tone="info" className="mx-auto w-full max-w-3xl" live={false}>Live proctor channel reconnecting…</Banner>}
          <ProctorWarningBanner warning={warning} fullscreen={isFullscreen} onDismiss={() => setWarning(null)} onReturnFullscreen={returnFullscreen} />
          {finished && <Banner tone="info" className="mx-auto w-full max-w-3xl"><span className="flex items-center gap-2"><Spinner size={14} />{finished.msg} {resultError || 'Waiting for the server to confirm your result…'}</span></Banner>}
        </div>
      </div>

      <main className="mx-auto w-full max-w-[1440px] flex-1 px-4 py-4 sm:px-6 sm:py-6">
        <div className="grid gap-5 lg:grid-cols-[210px_minmax(0,1fr)] xl:grid-cols-[220px_minmax(0,1fr)_300px]">
          <aside className="hidden lg:block">
            <div className="sticky top-24 rounded-xl border border-line bg-white p-3 shadow-card">
              <p className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">Sections</p>
              <nav className="space-y-1" aria-label="Exam sections">
                {sectionStats.map((s) => (
                  <button key={s.name} type="button" onClick={() => setIndex(s.first)} disabled={navigationDisabled} aria-current={s.active ? 'true' : undefined}
                    className={cx('w-full rounded-lg border px-2.5 py-2.5 text-left transition-colors', s.active ? 'border-primary/20 bg-primary-soft' : 'border-transparent hover:bg-canvas', navigationDisabled && 'cursor-not-allowed opacity-60')}>
                    <span className="flex items-center justify-between gap-2">
                      <span className={cx('truncate text-sm font-medium', s.active ? 'text-primary' : 'text-body')}>{s.name}</span>
                      <span className="tnum shrink-0 text-[11px] text-muted">{s.answered}/{s.total}</span>
                    </span>
                    <span className="mt-2 block h-1 overflow-hidden rounded-full bg-line">
                      <span className={cx('block h-full rounded-full', s.active ? 'bg-primary' : 'bg-slate-300')} style={{ width: `${s.total ? (s.answered / s.total) * 100 : 0}%` }} />
                    </span>
                  </button>
                ))}
              </nav>
            </div>
          </aside>

          <div className="min-w-0">
            {blocked ? (
              <FullscreenBlocker onReturn={returnFullscreen} />
            ) : questionState.loading ? (
              <div className="rounded-2xl border border-line bg-white px-6 py-14 text-center shadow-card" role="status" aria-live="polite">
                <p className="flex items-center justify-center gap-2 text-sm text-muted"><Spinner size={16} />Loading question {index + 1}…</p>
              </div>
            ) : questionState.error ? (
              <div className="rounded-2xl border border-line bg-white px-6 py-10 text-center shadow-card" role="alert">
                <TriangleAlert size={22} className="mx-auto text-warn-ink" aria-hidden />
                <p className="mt-3 text-sm font-medium text-ink">Could not load this question.</p>
                <p className="mt-1 text-sm text-muted">{questionState.error}</p>
                <Button className="mt-4" variant="secondary" onClick={() => loadQuestion(index)}>Try again</Button>
              </div>
            ) : question?.n === index ? (
              <article className="overflow-hidden rounded-2xl border border-line bg-white shadow-card">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4 sm:px-8">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">Question {index + 1} of {total}</p>
                    <p className="mt-0.5 text-xs text-muted">{question.section}</p>
                  </div>
                  <Badge tone={answers[question.id] !== undefined ? 'ok' : 'neutral'}>{answers[question.id] !== undefined ? 'Answered' : 'Not answered'}</Badge>
                </div>
                <div className="px-5 py-6 sm:px-8 sm:py-8">
                  <h1 className="text-[17px] font-medium leading-8 text-ink sm:text-[18px]" id="q-stem">{question.stem}</h1>
                  <div role="radiogroup" aria-labelledby="q-stem" className="mt-6 space-y-3">
                    {question.options.map((opt, i) => (
                      <AnswerOption key={`${question.id}-${i}`} name={`q-${question.id}`} letter={'ABCD'[i]} text={opt} checked={answers[question.id] === i} disabled={locked} onSelect={() => choose(question, i)} />
                    ))}
                  </div>
                  {saveState[question.id] === 'failed' && <p className="mt-4 flex items-start gap-2 rounded-lg bg-danger-soft px-3 py-2 text-sm text-danger-ink" role="status"><TriangleAlert size={15} className="mt-0.5 shrink-0" aria-hidden />This answer is not saved yet. We keep retrying; it stays selected here.</p>}
                </div>
              </article>
            ) : null}
          </div>

          <QuestionNavigatorPanel className="hidden xl:sticky xl:top-24 xl:block" sections={sections} current={index} answers={answers} onGo={setIndex} disabled={navigationDisabled} />
        </div>
      </main>

      <footer className="sticky bottom-0 z-20 border-t border-line bg-white/95 backdrop-blur">
        <div className="mx-auto w-full max-w-[1440px] px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 sm:px-6">
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={() => setIndex((i) => Math.max(0, i - 1))} disabled={index === 0 || locked || blocked} className="shrink-0 px-2.5 sm:px-4" aria-label="Previous question">
              <ArrowLeft size={16} aria-hidden /><span className="hidden sm:inline">Previous</span>
            </Button>
            <Button variant="secondary" onClick={() => setIndex((i) => Math.min(total - 1, i + 1))} disabled={index === total - 1 || locked || blocked} className="shrink-0 px-2.5 sm:px-4" aria-label="Next question">
              <span className="hidden sm:inline">Next</span><ArrowRight size={16} aria-hidden />
            </Button>
            <Button variant="secondary" onClick={() => setNavOpen(true)} disabled={navigationDisabled} className="tnum shrink-0 px-2.5 xl:hidden sm:px-4" aria-label={`Open question navigator, ${answered} of ${total} answered`}>
              <LayoutGrid size={16} aria-hidden /><span className="hidden sm:inline">Questions</span><span className="text-muted">{answered}/{total}</span>
            </Button>
            <div className="flex-1" />
            <Button onClick={() => { setSubmitError(''); setSubmitOpen(true); }} disabled={locked} className="shrink-0 px-2.5 sm:px-4" aria-label="Review and submit exam">
              <ShieldCheck size={16} aria-hidden /><span className="hidden sm:inline">Review &amp; submit</span><span className="sm:hidden">Review</span>
            </Button>
          </div>
        </div>
      </footer>

      <QuestionNavigator open={navOpen} onClose={() => setNavOpen(false)} sections={sections} current={index} answers={answers} onGo={setIndex} disabled={navigationDisabled} />
      <SubmitDialog open={submitOpen} onClose={() => setSubmitOpen(false)} onConfirm={submit} answered={answered} total={total} loading={submitting} error={submitError} />
      <Modal open={!!proctorMsg && !locked} onClose={() => setProctorMsg(null)} dismissible={false} title="Message from the exam team" size="sm"
        footer={<Button onClick={() => setProctorMsg(null)}>Acknowledge</Button>}>
        <p className="whitespace-pre-wrap text-[15px] leading-6">{proctorMsg?.text}</p>
      </Modal>
    </div>
  );
}
