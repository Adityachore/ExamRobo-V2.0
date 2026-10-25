import { useEffect, useMemo, useState } from 'react';
import { FileVideo, Play } from 'lucide-react';
import { api } from '../../lib/api.js';
import { useFetch } from '../../hooks/useFetch.js';
import { fmtAgo } from '../../lib/format.js';
import { Badge, Banner, Button, Card, EmptyState, Modal, PageHeader, Spinner, TableSkeleton, TableWrap, Td, Th, cx } from '../../components/ui.jsx';
import { EventSelect } from '../../components/admin.jsx';

/** Group sequence numbers into contiguous runs; everything between runs is a gap. */
function runsOf(seqs) {
  const runs = [];
  for (const s of seqs) {
    const last = runs[runs.length - 1];
    if (last && s === last.end + 1) last.end = s; else runs.push({ start: s, end: s });
  }
  return runs;
}
const mmss = (sec) => `${String(Math.floor(sec / 60)).padStart(2, '0')}:${String(sec % 60).padStart(2, '0')}`;

function Player({ rec, onClose }) {
  const runs = useMemo(() => runsOf(rec.seqs), [rec]);
  const [active, setActive] = useState(0);
  const [url, setUrl] = useState(null);
  const [state, setState] = useState('loading');
  const [error, setError] = useState('');
  const gaps = runs.slice(1).map((r, i) => ({ from: runs[i].end + 1, to: r.start - 1 }));

  useEffect(() => {
    let alive = true, obj = null;
    setState('loading'); setUrl(null); setError('');
    (async () => {
      try {
        const run = runs[active];
        const parts = [];
        for (let s = run.start; s <= run.end; s++) {
          const res = await api(`/admin/recordings/${encodeURIComponent(rec.key)}/chunks/${s}`, { role: 'admin', raw: true });
          parts.push(await res.blob());
        }
        if (!alive) return;
        obj = URL.createObjectURL(new Blob(parts, { type: rec.mime || 'video/webm' }));
        setUrl(obj); setState('ready');
      } catch (e) { if (alive) { setState('error'); setError(e.message); } }
    })();
    return () => { alive = false; if (obj) URL.revokeObjectURL(obj); };
  }, [rec, runs, active]);

  return (
    <Modal open onClose={onClose} title={`Recording — ${rec.name}`} description={rec.email} size="lg">
      <div className="space-y-3">
        {gaps.length > 0 && <Banner tone="warn" live={false} title="Recording gaps were detected. Some moments may be unavailable during playback.">
          {gaps.map((g) => <span key={g.from} className="tnum block">Missing chunks {g.from}–{g.to} (≈ {mmss(g.from * 10)} to {mmss((g.to + 1) * 10)})</span>)}
        </Banner>}
        {runs.length > 1 && (
          <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Recording segments">
            {runs.map((r, i) => <Button key={i} size="sm" variant={active === i ? 'primary' : 'secondary'} onClick={() => setActive(i)} className="tnum">Segment {i + 1} · chunks {r.start}–{r.end}</Button>)}
          </div>
        )}
        <div className="grid aspect-video place-items-center overflow-hidden rounded-lg bg-slate-900">
          {state === 'loading' && <p className="flex items-center gap-2 text-sm text-slate-300"><Spinner />Loading recording…</p>}
          {state === 'error' && <p className="px-6 text-center text-sm text-slate-300">Could not load this recording. {error}</p>}
          {state === 'ready' && <video key={url} src={url} controls className="h-full w-full" onError={() => { setState('error'); setError('The browser could not play this segment.'); }} />}
        </div>
        {active > 0 && <p className="text-xs text-muted">Segments after a gap are raw MediaRecorder data without the container header, so they may not play on their own. Nothing is re-encoded or repaired.</p>}
        {rec.seqs.length === 0 && <p className="text-sm text-muted">No chunks were received.</p>}
      </div>
    </Modal>
  );
}

export default function Recordings() {
  const events = useFetch('/admin/events');
  const [eventId, setEventId] = useState(null);
  const { data, error, loading, reload } = useFetch(`/admin/recordings${eventId ? `?event_id=${eventId}` : ''}`);
  const [sel, setSel] = useState(null);
  const evName = (id) => events.data?.events.find((e) => e.id === id)?.name || `Event ${id}`;

  return (
    <>
      <PageHeader title="Recordings" description="Raw screen-recording chunks per student. Missing chunks are shown, never hidden." actions={events.data && <EventSelect events={events.data.events} value={eventId} onChange={setEventId} allLabel="All events" />} />
      <Card>
        {loading && !data && <TableSkeleton />}
        {error && <div className="p-4"><Banner tone="error" action={<Button size="sm" variant="secondary" onClick={reload}>Retry</Button>}>{error.message}</Banner></div>}
        {data && data.recordings.length === 0 && <EmptyState icon={<FileVideo size={20} />} title="No recordings yet">Recordings appear once students start an exam.</EmptyState>}
        {data && data.recordings.length > 0 && (
          <TableWrap>
            <thead><tr><Th>Student</Th><Th>Event</Th><Th className="text-right">Chunks</Th><Th>Gaps</Th><Th>≈ Duration</Th><Th>Last chunk</Th><Th><span className="sr-only">Play</span></Th></tr></thead>
            <tbody>
              {data.recordings.map((r) => (
                <tr key={r.key}>
                  <Td><p className="font-medium">{r.name}</p><p className="text-xs text-muted">{r.email}</p></Td>
                  <Td className="text-muted">{evName(r.event_id)}</Td>
                  <Td className="tnum text-right">{r.chunk_count}</Td>
                  <Td>{r.gap_count > 0 ? <Badge tone="warn">Recording gaps · {r.gap_count}</Badge> : r.chunk_count ? <Badge tone="ok">None</Badge> : <Badge tone="neutral">No data</Badge>}</Td>
                  <Td className="tnum">{r.chunk_count ? mmss(r.approx_duration_sec) : '—'}</Td>
                  <Td className="tnum text-muted">{fmtAgo(r.last_chunk_at)}</Td>
                  <Td><div className="flex justify-end"><Button size="sm" variant="secondary" disabled={!r.chunk_count} onClick={() => setSel(r)}><Play size={13} />Play</Button></div></Td>
                </tr>
              ))}
            </tbody>
          </TableWrap>
        )}
      </Card>
      {sel && <Player rec={sel} onClose={() => setSel(null)} />}
    </>
  );
}
