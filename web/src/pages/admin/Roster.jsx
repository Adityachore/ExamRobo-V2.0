import { useEffect, useMemo, useRef, useState } from 'react';
import { Search, Upload, Users } from 'lucide-react';
import { api } from '../../lib/api.js';
import { useFetch } from '../../hooks/useFetch.js';
import { fmtDateTime } from '../../lib/format.js';
import { Banner, Button, Card, EmptyState, Input, PageHeader, TableSkeleton, TableWrap, Td, Textarea, Th, useToast } from '../../components/ui.jsx';
import { EventSelect, RosterBadge } from '../../components/admin.jsx';

export default function Roster() {
  const toast = useToast();
  const events = useFetch('/admin/events');
  const [eventId, setEventId] = useState(null);
  const roster = useFetch(eventId ? `/admin/events/${eventId}/roster` : null);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [summary, setSummary] = useState(null);
  const [q, setQ] = useState('');
  const fileRef = useRef(null);

  useEffect(() => { if (eventId == null && events.data?.events?.length) setEventId(events.data.events[0].id); }, [events.data, eventId]);
  useEffect(() => { setSummary(null); setErr(''); }, [eventId]);

  const ev = events.data?.events.find((e) => e.id === eventId);
  const rows = useMemo(() => (roster.data?.roster || []).filter((r) => !q || r.email.includes(q.toLowerCase()) || r.name.toLowerCase().includes(q.toLowerCase())), [roster.data, q]);

  const onFile = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    try { setText(await f.text()); setErr(''); } catch { setErr('Could not read that file.'); }
    e.target.value = '';
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!text.trim()) { setErr('Paste at least one line in the form email,name.'); return; }
    setBusy(true); setErr(''); setSummary(null);
    try {
      const r = await api(`/admin/events/${eventId}/roster`, { method: 'POST', role: 'admin', body: { text } });
      setSummary(r);
      toast(`Roster updated: ${r.added} added, ${r.updated} updated`);
      if (!r.invalid?.length) setText('');
      roster.reload(); events.reload();
    } catch (ex) { setErr(ex.message); } finally { setBusy(false); }
  };

  return (
    <>
      <PageHeader title="Roster" description="Only emails on the roster can sign in for this event." actions={events.data && <EventSelect events={events.data.events} value={eventId} onChange={setEventId} />} />
      {events.error && <Banner tone="error" className="mb-4" action={<Button size="sm" variant="secondary" onClick={events.reload}>Retry</Button>}>{events.error.message}</Banner>}

      {ev && (
        <>
          <Card className="mb-4 p-5">
            <form onSubmit={submit} noValidate>
              <div className="mb-2 flex items-center justify-between">
                <label htmlFor="paste" className="text-[13px] font-medium">Add or update via paste</label>
                <div className="flex items-center gap-2"><RosterBadge ev={ev} /><span className="tnum text-xs text-muted">{ev.roster_updated_at ? `Last updated ${fmtDateTime(ev.roster_updated_at)}` : ''}</span></div>
              </div>
              <Textarea id="paste" rows={5} value={text} onChange={(e) => setText(e.target.value)} placeholder={'john.doe@example.com, John Doe\nsarah.lee@example.com, Sarah Lee'} className="tnum font-mono text-[13px]" aria-describedby="paste-hint" />
              <p id="paste-hint" className="mt-1 text-xs text-muted">One student per line as <code>email,name</code>. Existing emails are updated; new ones are added.</p>
              {err && <Banner tone="error" className="mt-3">{err}</Banner>}
              {summary && (
                <Banner tone={summary.invalid?.length ? 'warn' : 'ok'} className="mt-3" title={`Roster updated: ${summary.added} added, ${summary.updated} updated`}>
                  {summary.invalid?.length > 0 && <><p>{summary.invalid.length} {summary.invalid.length === 1 ? 'line was' : 'lines were'} skipped as invalid and are still in the box above:</p>
                    <ul className="mt-1 list-disc pl-5 text-xs">{summary.invalid.slice(0, 8).map((x) => <li key={x.line}>Line {x.line}: <code>{x.value}</code></li>)}</ul></>}
                </Banner>
              )}
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Button type="submit" loading={busy}>{busy ? 'Importing…' : 'Import roster'}</Button>
                <input ref={fileRef} type="file" accept=".csv,.txt,text/csv,text/plain" className="sr-only" id="csv" onChange={onFile} />
                <Button type="button" variant="secondary" onClick={() => fileRef.current?.click()}><Upload size={14} />Load CSV into box</Button>
              </div>
            </form>
          </Card>

          <Card>
            <div className="flex items-center justify-between gap-3 border-b border-line p-3">
              <p className="px-1 text-sm font-medium">Current roster <span className="tnum text-muted">({q ? `${rows.length} of ${roster.data?.roster.length ?? '…'}` : (roster.data?.roster.length ?? '…')} students)</span></p>
              <div className="relative"><Search size={14} className="pointer-events-none absolute left-3 top-3 text-slate-400" aria-hidden /><Input aria-label="Search roster" placeholder="Search name or email" value={q} onChange={(e) => setQ(e.target.value)} className="h-9 w-56 pl-8 text-sm" /></div>
            </div>
            {roster.loading && !roster.data && <TableSkeleton cols={3} />}
            {roster.error && <div className="p-4"><Banner tone="error" action={<Button size="sm" variant="secondary" onClick={roster.reload}>Retry</Button>}>{roster.error.message}</Banner></div>}
            {roster.data && roster.data.roster.length === 0 && <EmptyState icon={<Users size={20} />} title="This roster is empty">Paste a list above to invite students to this event.</EmptyState>}
            {roster.data && roster.data.roster.length > 0 && rows.length === 0 && <EmptyState title="No matches">No student matches “{q}”.</EmptyState>}
            {rows.length > 0 && (
              <TableWrap>
                <thead><tr><Th>#</Th><Th>Email</Th><Th>Name</Th><Th>Updated</Th></tr></thead>
                <tbody>{rows.map((r, i) => <tr key={r.email}><Td className="tnum text-muted">{i + 1}</Td><Td>{r.email}</Td><Td>{r.name}</Td><Td className="tnum text-muted">{fmtDateTime(r.updated_at)}</Td></tr>)}</tbody>
              </TableWrap>
            )}
          </Card>
        </>
      )}
      {events.data && events.data.events.length === 0 && <Card><EmptyState title="No events yet">Create an event first, then import its roster.</EmptyState></Card>}
    </>
  );
}
