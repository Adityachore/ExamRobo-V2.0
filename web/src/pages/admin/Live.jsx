import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Flag, Lock, MessageSquare, OctagonX, Radio } from 'lucide-react';
import { api, wsTicket, wsUrl } from '../../lib/api.js';
import { useFetch } from '../../hooks/useFetch.js';
import { fmtTime } from '../../lib/format.js';
import { Badge, Banner, Button, Card, ConfirmDialog, EmptyState, Field, Modal, PageHeader, TableWrap, Td, Textarea, Th, useToast } from '../../components/ui.jsx';
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
};

// danger = the exam was ended, warn = a warning was counted, blue = logged only.
function kindTone(kind) {
  if (kind === 'locked') return 'danger';
  if (kind === 'screenshot_key' || kind === 'recording_revoked') return 'warn';
  if (kind === 'submitted') return 'neutral';
  if (kind === 'started' || kind === 'message' || kind === 'devtools' || kind === 'share_surface' || kind === 'os_chord' || kind === 'network_gap') return 'blue';
  return 'warn';
}

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
  const [forceBusy, setForceBusy] = useState(false);
  const [forceErr, setForceErr] = useState('');

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
    const sync = async () => { try { const r = await api('/admin/live', { role: 'admin' }); applySnapshot(r.sessions, r.events); setLoadErr(''); } catch (e) { setLoadErr(e.message); } };
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
          // A cheap update: the answer count or the recording state changed.
          setSessions((s) => {
            const cur = s[m.key];
            if (!cur) return s;
            const merged = { ...cur, ...m.patch };
            if (m.patch.chunk_count !== undefined) {
              merged.gaps = Number(merged.max_chunk ?? -1) + 1 - Number(merged.chunk_count || 0);
            }
            return { ...s, [m.key]: merged };
          });
        }
        if (m.type === 'event') addEvents([m.event]);
      };
      ws.onclose = () => { if (closed) return; setConn(wait > 4000 ? 'lost' : 'reconnecting'); retry = setTimeout(open, wait); wait = Math.min(wait * 2, 10000); };
    };
    open();
    return () => { closed = true; clearTimeout(retry); ws?.close(); };
  }, [applySnapshot, addEvents]);

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
                return (
                  <tr key={s.key} className={s.locked ? 'bg-danger-soft/40' : s.warnings >= 3 && s.status === 'active' ? 'bg-warn-soft/50' : ''}>
                    <Td><p className="font-medium">{s.name}</p><p className="text-xs text-muted">{s.email}</p></Td>
                    <Td className="text-muted">{evName(s.event_id)}</Td>
                    <Td className="tnum">Q{s.current_index + 1}<span className="text-muted"> · {s.answered}/{s.total}</span></Td>
                    <Td className="tnum">
                      {s.warnings > 0 ? <Badge tone={s.warnings >= 3 ? 'danger' : 'warn'}>{s.warnings}{s.warnings >= 3 ? ' · review' : ''}</Badge> : <span className="text-muted">0</span>}
                      {(s.violation_kinds || []).length > 0 && (
                        <div className="mt-1 flex flex-wrap gap-1">{s.violation_kinds.map((k) => <Badge key={k} tone={kindTone(k)}>{KIND[k] || k}</Badge>)}</div>
                      )}
                    </Td>
                    <Td>{s.locked ? <Badge tone="danger">Locked</Badge> : s.status === 'submitted' ? <Badge tone="neutral">Submitted</Badge> : <Badge tone="ok">In progress</Badge>}
                      {s.status === 'active' && s.last_seen_at && <p className="mt-0.5 text-xs text-muted">Last contact {fmtTime(s.last_seen_at)}</p>}
                      {s.lock_reason && <p className="mt-0.5 text-xs text-muted">{s.lock_reason}</p>}</Td>
                    <Td>
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="sm" aria-label={`Send message to ${s.name}`} disabled={s.status !== 'active'} onClick={() => setAction({ kind: 'message', target: s })}><MessageSquare size={14} /></Button>
                        <Button variant="ghost" size="sm" aria-label={`Flag ${s.name}`} onClick={() => setAction({ kind: 'flag', target: s })}><Flag size={14} /></Button>
                        <Button variant="ghost" size="sm" aria-label={`Lock ${s.name}`} disabled={s.status !== 'active'} onClick={() => setAction({ kind: 'lock', target: s })}><Lock size={14} className="text-danger" /></Button>
                        <Button variant="ghost" size="sm" aria-label={`Force submit ${s.name}`} disabled={s.status !== 'active'} onClick={() => { setForceErr(''); setAction({ kind: 'force', target: s }); }}><OctagonX size={14} className="text-danger" /></Button>
                      </div>
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </TableWrap>
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

      <ActionModal kind={action.kind} target={action.target} onClose={() => setAction({ kind: null, target: null })} />
      <ConfirmDialog open={action.kind === 'force'} onClose={() => setAction({ kind: null, target: null })} onConfirm={force} loading={forceBusy} error={forceErr} danger confirmLabel="Force submit"
        title="Force-submit this exam?" description={action.target ? `${action.target.name}'s exam will be submitted and graded immediately. They cannot continue.` : ''} />
    </>
  );
}
