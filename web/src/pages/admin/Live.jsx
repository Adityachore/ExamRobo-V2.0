import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, ChevronRight, Flag, Lock, MessageSquare, OctagonX, Radio, RotateCcw, TimerReset } from 'lucide-react';
import { api, wsTicket, wsUrl } from '../../lib/api.js';
import { useFetch } from '../../hooks/useFetch.js';
import { fmtTime } from '../../lib/format.js';
import { Badge, Banner, Button, Card, ConfirmDialog, EmptyState, Field, Input, Modal, PageHeader, Spinner, TableWrap, Td, Textarea, Th, useToast } from '../../components/ui.jsx';
import { EventSelect } from '../../components/admin.jsx';

const KIND = {
  started: 'Exam started',
  tab_blur: 'Tab blur',
  fullscreen_exit: 'Fullscreen exit',
  submitted: 'Submitted',
  message: 'Message sent',
  clipboard: 'Clipboard',
  context_menu: 'Context menu',
  print: 'Print',
  screenshot_key: 'Screenshot key',
  recording_revoked: 'Recording stopped',
  second_window: 'Second window',
  second_session: 'Second session',
  display_change: 'Display changed',
  devtools: 'DevTools open',
  share_surface: 'Shared a window',
  os_chord: 'OS key pressed',
  network_gap: 'Connection gap',
  locked: 'Locked',
  resumed: 'Resumed',
  restarted: 'Restarted',
  removed: 'Removed',
};

// danger = the exam was ended, warn = a warning was counted, blue = logged only.
function kindTone(kind) {
  if (kind === 'locked' || kind === 'removed') return 'danger';
  if (kind === 'screenshot_key' || kind === 'recording_revoked') return 'warn';
  if (kind === 'submitted') return 'neutral';
  if (kind === 'started' || kind === 'message' || kind === 'devtools' || kind === 'share_surface' || kind === 'os_chord' || kind === 'network_gap' || kind === 'resumed' || kind === 'restarted') return 'blue';
  return 'warn';
}

const RESUMABLE = new Set(['integrity_lockout', 'force_submit', 'time_expired']);

function ConnChip({ state, lastUpdate }) {
  if (state === 'live') return <Badge tone="ok" icon={<Radio size={12} />}>Live</Badge>;
  if (state === 'reconnecting') return <Badge tone="warn" icon={<Radio size={12} />}>Reconnecting… {lastUpdate ? `last update ${fmtTime(lastUpdate)}` : ''}</Badge>;
  return <Badge tone="danger" icon={<Radio size={12} />}>Connection lost — retrying</Badge>;
}

function ActionModal({ kind, target, onClose }) {
  const toast = useToast();
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  useEffect(() => { setText(''); setErr(''); }, [target, kind]);
  const isMsg = kind === 'message';
  const isLock = kind === 'lock';
  const submit = async (e) => {
    e.preventDefault();
    if (!text.trim()) { setErr(isMsg ? 'Write a message first.' : 'A reason is required.'); return; }
    setBusy(true); setErr('');
    try {
      if (isMsg) await api('/admin/message', { method: 'POST', role: 'admin', body: { key: target.key, message: text.trim() } });
      else if (isLock) await api('/admin/lock', { method: 'POST', role: 'admin', body: { key: target.key, reason: text.trim() } });
      else await api('/admin/flags', { method: 'POST', role: 'admin', body: { kind: 'MISCONDUCT', email: target.email, event_id: target.event_id, reason: text.trim() } });
      toast(isMsg ? `Message sent to ${target.name}.` : isLock ? `${target.name}'s exam was locked, submitted and graded.` : `Flag raised for ${target.name}.`);
      onClose();
    } catch (ex) { setErr(ex.message); } finally { setBusy(false); }
  };
  return (
    <Modal open={!!target && !!kind && kind !== 'force'} onClose={onClose}
      title={isMsg ? 'Send message' : isLock ? 'Lock this exam' : 'Flag student for misconduct'}
      description={target ? `${target.name} · ${target.email}` : ''}>
      <form onSubmit={submit} noValidate className="space-y-3">
        {err && <Banner tone="error">{err}</Banner>}
        <Field label={isMsg ? 'Message' : 'Reason'}
          hint={isMsg ? 'The student sees this immediately in a dialog.' : isLock ? 'The exam is submitted with the attempted score and graded, a MISCONDUCT flag is raised and the student is signed out.' : 'Recorded as a MISCONDUCT flag. Roster/HR issues belong under Flags.'}>
          {(p) => <Textarea {...p} rows={3} value={text} onChange={(e) => setText(e.target.value)} />}
        </Field>
        <div className="flex justify-end gap-2"><Button type="button" variant="secondary" onClick={onClose}>Cancel</Button><Button type="submit" loading={busy} variant={isLock ? 'danger' : 'primary'}>{isMsg ? 'Send message' : isLock ? 'Lock exam' : 'Create flag'}</Button></div>
      </form>
    </Modal>
  );
}

/** A5 — live proctor. WS pushes updates; REST state is fetched on mount and after every reconnect. */
function AttemptModal({ action, onClose, onDone }) {
  const toast = useToast();
  const target = action.target;
  const resume = action.kind === 'resume';
  const [minutes, setMinutes] = useState('15');
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    setMinutes('15'); setReason(''); setErr('');
  }, [action]);

  const submit = async (e) => {
    e.preventDefault();
    if (!reason.trim()) { setErr('A reason is required.'); return; }
    if (resume && !(Number(minutes) >= 1)) { setErr('Enter at least one minute.'); return; }
    setBusy(true); setErr('');
    try {
      await api(resume ? '/admin/resume' : '/admin/restart', {
        method: 'POST',
        role: 'admin',
        body: { key: target.key, reason: reason.trim(), minutes: Number(minutes) },
      });
      toast(resume ? `${target.name}'s session was resumed.` : `${target.name} was restarted with a fresh paper.`);
      onDone();
      onClose();
    } catch (ex) {
      setErr(ex.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal open={!!action.kind} onClose={onClose} title={resume ? 'Resume this session' : 'Restart with a fresh paper'}
      description={target ? `${target.name} - ${target.email}` : ''} size="sm">
      <form onSubmit={submit} noValidate className="space-y-3">
        {err && <Banner tone="error">{err}</Banner>}
        {resume ? (
          <>
            <Field label="Extension (minutes)" hint="The paper deadline is extended by this amount. Section clocks start again when the student reopens a section.">
              {(p) => <Input {...p} type="number" min={1} max={1440} value={minutes} onChange={(e) => setMinutes(e.target.value)} className="tnum" />}
            </Field>
            <p className="text-xs text-muted">Answers, progress and warnings are preserved. Only locked, force-submitted or time-expired papers can be resumed.</p>
          </>
        ) : (
          <p className="text-xs text-muted">The current attempt is saved to history, then a new paper with the same selected domains is generated. Answers, warnings and score are reset.</p>
        )}
        <Field label="Reason">
          {(p) => <Textarea {...p} rows={3} value={reason} onChange={(e) => setReason(e.target.value)} />}
        </Field>
        <div className="flex justify-end gap-2 border-t border-line pt-3">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={busy}>{resume ? 'Resume session' : 'Restart paper'}</Button>
        </div>
      </form>
    </Modal>
  );
}

export default function Live() {
  const toast = useToast();
  const events = useFetch('/admin/events');
  const [eventId, setEventId] = useState(null);
  const [sessions, setSessions] = useState({});
  const [feed, setFeed] = useState([]);
  const seen = useRef(new Set());
  const [conn, setConn] = useState('reconnecting');
  const [lastUpdate, setLastUpdate] = useState(null);
  const [loadErr, setLoadErr] = useState('');
  const [loaded, setLoaded] = useState(false);
  const [action, setAction] = useState({ kind: null, target: null });
  const [attempt, setAttempt] = useState({ kind: null, target: null });
  const [forceBusy, setForceBusy] = useState(false);
  const [forceErr, setForceErr] = useState('');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ total: 0, pages: 1 });
  const [refresh, setRefresh] = useState(0);
  const [openKey, setOpenKey] = useState(null);
  const [detailEvents, setDetailEvents] = useState([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailErr, setDetailErr] = useState('');
  const openPaperRef = useRef(null);
  const detailReq = useRef(0);

  const addEvents = useCallback((list) => {
    const fresh = list.filter((e) => !seen.current.has(e.id)); // no duplicates after reconnects
    if (!fresh.length) return;
    fresh.forEach((e) => seen.current.add(e.id));
    setFeed((f) => [...fresh, ...f].sort((a, b) => Date.parse(b.at) - Date.parse(a.at)).slice(0, 150));
  }, []);
  const applySnapshot = useCallback((sess, evs) => {
    setSessions(Object.fromEntries(sess.map((s) => [s.key, s])));
    addEvents(evs);
    setLastUpdate(Date.now()); setLoaded(true);
  }, [addEvents]);

  useEffect(() => {
    let ws, retry, closed = false, wait = 1000;
    const sync = async () => {
      try {
        const qs = new URLSearchParams({ limit: '50', page: String(page) });
        if (eventId) qs.set('event_id', eventId);
        const r = await api(`/admin/live?${qs}`, { role: 'admin' });
        applySnapshot(r.sessions, r.events);
        setMeta({ total: r.total || r.sessions.length, pages: r.pages || 1 });
        setLoadErr('');
      } catch (e) {
        setLoadErr(e.message);
      }
    };
    sync();
    const open = async () => {
      if (closed) return;
      try {
        const ticket = await wsTicket('admin');
        if (closed) return;
        ws = new WebSocket(wsUrl(ticket));
      } catch {
        if (closed) return;
        setConn('reconnecting');
        retry = setTimeout(open, wait); wait = Math.min(wait * 2, 10000);
        return;
      }
      ws.onopen = () => { wait = 1000; setConn('live'); sync(); };
      ws.onmessage = (ev) => {
        let m; try { m = JSON.parse(ev.data); } catch { return; }
        setLastUpdate(Date.now());
        if (m.type === 'snapshot') applySnapshot(m.sessions, m.events);
        if (m.type === 'session') setSessions((s) => ({ ...s, [m.session.key]: m.session }));
        if (m.type === 'session_patch') {
          setSessions((s) => {
            const cur = s[m.key];
            if (!cur) return s;
            return { ...s, [m.key]: { ...cur, ...m.patch } };
          });
        }
        if (m.type === 'event') {
          addEvents([m.event]);
          if (m.event.paper_id && m.event.paper_id === openPaperRef.current) {
            setDetailEvents((list) => (list.some((e) => e.id === m.event.id) ? list : [m.event, ...list]));
          }
        }
      };
      ws.onclose = () => { if (closed) return; setConn(wait > 4000 ? 'lost' : 'reconnecting'); retry = setTimeout(open, wait); wait = Math.min(wait * 2, 10000); };
    };
    open();
    return () => { closed = true; clearTimeout(retry); ws?.close(); };
  }, [applySnapshot, addEvents, eventId, page, refresh]);

  useEffect(() => { setPage(1); }, [eventId]);

  const stale = conn !== 'live';
  const rows = useMemo(() => Object.values(sessions).filter((s) => !eventId || s.event_id === eventId).sort((a, b) => b.warnings - a.warnings || a.name.localeCompare(b.name)), [sessions, eventId]);
  const feedRows = useMemo(() => {
    const byEmail = Object.fromEntries(Object.values(sessions).map((s) => [s.email, s.event_id]));
    return feed.filter((e) => !eventId || byEmail[e.email] === eventId);
  }, [feed, eventId, sessions]);
  const evName = (id) => events.data?.events.find((e) => e.id === id)?.name || `Event ${id}`;
  const active = rows.filter((r) => r.status === 'active').length;

  const force = async () => {
    setForceBusy(true); setForceErr('');
    try { await api('/admin/force-submit', { method: 'POST', role: 'admin', body: { key: action.target.key } }); toast(`${action.target.name}'s exam was submitted and graded.`); setAction({ kind: null, target: null }); }
    catch (e) { setForceErr(e.message); } finally { setForceBusy(false); }
  };

  const closeDetail = () => {
    detailReq.current += 1;
    openPaperRef.current = null;
    setOpenKey(null);
    setDetailEvents([]);
    setDetailErr('');
    setDetailLoading(false);
  };

  const loadDetail = async (session) => {
    const req = detailReq.current + 1;
    detailReq.current = req;
    openPaperRef.current = session.paper_id || null;
    setOpenKey(session.key);
    setDetailEvents([]);
    setDetailErr('');
    setDetailLoading(true);
    try {
      const r = await api(`/admin/session?key=${encodeURIComponent(session.key)}`, { role: 'admin' });
      if (req !== detailReq.current) return;
      setDetailEvents((prev) => {
        const byId = new Map([...prev, ...(r.events || [])].map((e) => [e.id, e]));
        return [...byId.values()].sort((a, b) => Date.parse(b.at) - Date.parse(a.at));
      });
    } catch (e) {
      if (req === detailReq.current) setDetailErr(e.message);
    } finally {
      if (req === detailReq.current) setDetailLoading(false);
    }
  };

  const toggleDetail = (session) => {
    if (openKey === session.key) closeDetail();
    else loadDetail(session);
  };

  return (
    <>
      <PageHeader title="Live proctor" description={`${active} active ${active === 1 ? 'session' : 'sessions'}`} actions={<><ConnChip state={conn} lastUpdate={lastUpdate} />{events.data && <EventSelect events={events.data.events} value={eventId} onChange={setEventId} allLabel="All events" />}</>} />
      {stale && loaded && <Banner tone="warn" className="mb-3" live={false}>Live data is not up to date. Values below may be stale until the connection returns.</Banner>}
      {loadErr && !loaded && <Banner tone="error" className="mb-3">{loadErr}</Banner>}

      <Card className="mb-4">
        {rows.length === 0 ? <EmptyState icon={<Radio size={20} />} title="No exam sessions yet">When students begin an exam they appear here in real time.</EmptyState> : (
          <TableWrap>
            <thead><tr><Th>Student</Th><Th>Event</Th><Th>Question</Th><Th>Warnings</Th><Th>Status</Th><Th><span className="sr-only">Actions</span></Th></tr></thead>
            <tbody className={stale ? 'opacity-60' : ''}>
              {rows.map((s) => {
                const open = openKey === s.key;
                const pct = s.total ? Math.min(100, Math.round((s.answered / s.total) * 100)) : 0;
                return (
                  <Fragment key={s.key}>
                    <tr className={s.locked ? 'bg-danger-soft/40' : s.warnings >= 3 && s.status === 'active' ? 'bg-warn-soft/50' : ''}>
                      <Td>
                        <button type="button" onClick={() => toggleDetail(s)} aria-expanded={open} aria-controls={`student-detail-${s.key}`} className="inline-flex items-center gap-1 text-left font-medium text-ink hover:text-primary hover:underline">
                          {s.name}
                          {open ? <ChevronDown size={13} className="text-muted" aria-hidden /> : <ChevronRight size={13} className="text-muted opacity-60" aria-hidden />}
                        </button>
                        <p className="text-xs text-muted">{s.email}</p>
                      </Td>
                      <Td className="text-muted">{evName(s.event_id)}</Td>
                      <Td className="tnum">{s.section_name || '-'}<span className="text-muted"> | Q{s.current_index + 1} | {s.answered}/{s.total}</span></Td>
                      <Td className="tnum">
                        {s.warnings > 0 ? <Badge tone={s.warnings >= 3 ? 'danger' : 'warn'}>{s.warnings}{s.warnings >= 3 ? ' - review' : ''}</Badge> : <span className="text-muted">0</span>}
                        {(s.violation_kinds || []).length > 0 && (
                          <div className="mt-1 flex flex-wrap gap-1">{s.violation_kinds.map((k) => <Badge key={k} tone={kindTone(k)}>{KIND[k] || k}</Badge>)}</div>
                        )}
                      </Td>
                      <Td>{s.locked ? <Badge tone="danger">Locked</Badge> : s.status === 'submitted' ? <Badge tone="neutral">Submitted</Badge> : <Badge tone="ok">In progress</Badge>}
                        {s.status === 'active' && s.last_seen_at && <p className="mt-0.5 text-xs text-muted">Last contact {fmtTime(s.last_seen_at)}</p>}
                        {s.lock_reason && <p className="mt-0.5 text-xs text-muted">{s.lock_reason}</p>}</Td>
                      <Td>
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="sm" aria-label={`Send message to ${s.name}`} title="Send a message to this student" disabled={s.status !== 'active'} onClick={() => setAction({ kind: 'message', target: s })}><MessageSquare size={14} /></Button>
                          <Button variant="ghost" size="sm" aria-label={`Flag ${s.name}`} title="Flag this student for misconduct" onClick={() => setAction({ kind: 'flag', target: s })}><Flag size={14} /></Button>
                          <Button variant="ghost" size="sm" aria-label={`Lock ${s.name}`} title="Lock and submit this exam" disabled={s.status !== 'active'} onClick={() => setAction({ kind: 'lock', target: s })}><Lock size={14} className="text-danger" /></Button>
                          <Button variant="ghost" size="sm" aria-label={`Force submit ${s.name}`} title="Force-submit this exam" disabled={s.status !== 'active'} onClick={() => { setForceErr(''); setAction({ kind: 'force', target: s }); }}><OctagonX size={14} className="text-danger" /></Button>
                          {s.status === 'submitted' && RESUMABLE.has(s.submit_reason) && (
                            <Button variant="ghost" size="sm" aria-label={`Resume ${s.name}`} title="Resume with fresh section clocks" onClick={() => setAttempt({ kind: 'resume', target: s })}><TimerReset size={14} /></Button>
                          )}
                          {s.status === 'submitted' && (
                            <Button variant="ghost" size="sm" aria-label={`Restart ${s.name}`} title="Restart with a fresh paper" onClick={() => setAttempt({ kind: 'restart', target: s })}><RotateCcw size={14} /></Button>
                          )}
                        </div>
                      </Td>
                    </tr>
                    {open && (
                      <tr className="bg-canvas/40">
                        <Td colSpan={6} className="align-top" style={{ padding: 0 }}>
                          <div id={`student-detail-${s.key}`} className="border-b border-line px-4 py-4 sm:px-6">
                            <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
                              <div>
                                <p className="text-sm font-semibold">Student details</p>
                                <p className="text-xs text-muted">Live position and full activity history. Updates as the student works.</p>
                              </div>
                              <Button size="sm" variant="ghost" onClick={closeDetail}>Hide details</Button>
                            </div>
                            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                              {[
                                ['Section', s.section_name || '-', `Q${s.current_index + 1} of ${s.total}`],
                                ['Answered', `${s.answered}/${s.total}`, `${pct}% complete`],
                                ['Warnings', String(s.warnings), s.warnings >= 3 ? 'Flagged for review' : 'No review flag'],
                                ['Last contact', fmtTime(s.last_seen_at), ''],
                                ['Started', fmtTime(s.started_at), ''],
                                ['Deadline', fmtTime(s.ends_at), ''],
                                ['Event', evName(s.event_id), ''],
                              ].map(([label, value, hint]) => (
                                <div key={label} className="rounded-md border border-line bg-white px-3 py-2">
                                  <p className="text-[11px] font-medium uppercase tracking-wide text-muted">{label}</p>
                                  <p className="mt-0.5 truncate text-sm font-medium">{value}</p>
                                  {hint && <p className="text-xs text-muted">{hint}</p>}
                                </div>
                              ))}
                            </div>
                            <div className="mt-3">
                              <div className="mb-1 flex items-center justify-between text-xs text-muted"><span>Answer progress</span><span className="tnum">{pct}%</span></div>
                              <div className="h-1.5 overflow-hidden rounded-full bg-slate-200" aria-hidden><div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} /></div>
                            </div>
                            {(s.violation_kinds || []).length > 0 && (
                              <div className="mt-3 flex flex-wrap items-center gap-1.5">
                                <span className="text-xs text-muted">Detected:</span>
                                {s.violation_kinds.map((k) => <Badge key={k} tone={kindTone(k)}>{KIND[k] || k}</Badge>)}
                              </div>
                            )}
                            <div className="mt-4">
                              <div className="mb-2 flex items-center justify-between">
                                <p className="text-sm font-medium">Activity</p>
                                <span className="text-xs text-muted">{detailLoading ? 'Loading...' : `${detailEvents.length} event${detailEvents.length === 1 ? '' : 's'}`}</span>
                              </div>
                              {detailErr && <Banner tone="error" action={<Button size="sm" variant="secondary" onClick={() => loadDetail(s)}>Retry</Button>}>{detailErr}</Banner>}
                              {!detailErr && detailLoading && <p className="flex items-center gap-2 py-2 text-sm text-muted"><Spinner size={14} />Loading this student's activity...</p>}
                              {!detailErr && !detailLoading && detailEvents.length === 0 && <p className="py-2 text-sm text-muted">No activity recorded yet.</p>}
                              {detailEvents.length > 0 && (
                                <ul className="max-h-72 divide-y divide-line overflow-y-auto rounded-lg border border-line bg-white">
                                  {detailEvents.map((e) => (
                                    <li key={e.id} className="flex items-center gap-3 px-3 py-2 text-sm">
                                      <span className="tnum w-20 shrink-0 text-xs text-muted">{fmtTime(e.at)}</span>
                                      <Badge tone={kindTone(e.kind)}>{KIND[e.kind] || e.kind}</Badge>
                                      <span className="min-w-0 flex-1 truncate text-muted">{e.detail || '-'}</span>
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          </div>
                        </Td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </TableWrap>
        )}
        {meta.pages > 1 && (
          <div className="flex items-center justify-between gap-3 border-t border-line px-4 py-2.5 text-sm">
            <span className="tnum text-muted">{meta.total} sessions</span>
            <div className="flex items-center gap-2">
              <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
              <span className="tnum text-muted">Page {page} of {meta.pages}</span>
              <Button variant="secondary" size="sm" disabled={page >= meta.pages} onClick={() => setPage((p) => p + 1)}>Next</Button>
            </div>
          </div>
        )}
      </Card>

      <Card>
        <div className="border-b border-line px-4 py-2.5 text-sm font-medium">Live event feed</div>
        {feedRows.length === 0 ? <p className="px-4 py-6 text-center text-sm text-muted">No events yet.</p> : (
          <ul className="max-h-80 divide-y divide-line overflow-y-auto" aria-live="off">
            {feedRows.map((e) => (
              <li key={e.id} className="flex items-center gap-3 px-4 py-2 text-sm">
                <span className="tnum w-20 shrink-0 text-xs text-muted">{fmtTime(e.at)}</span>
                <span className="w-32 shrink-0 truncate font-medium">{e.name}</span>
                <Badge tone={kindTone(e.kind)}>{KIND[e.kind] || e.kind}</Badge>
                <span className="truncate text-muted">{e.detail}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <AttemptModal action={attempt} onClose={() => setAttempt({ kind: null, target: null })} onDone={() => setRefresh((n) => n + 1)} />
      <ActionModal kind={action.kind} target={action.target} onClose={() => setAction({ kind: null, target: null })} />
      <ConfirmDialog open={action.kind === 'force'} onClose={() => setAction({ kind: null, target: null })} onConfirm={force} loading={forceBusy} error={forceErr} danger confirmLabel="Force submit"
        title="Force-submit this exam?" description={action.target ? `${action.target.name}'s exam will be submitted and graded immediately. They cannot continue.` : ''} />
    </>
  );
}
