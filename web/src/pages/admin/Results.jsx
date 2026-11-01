import { Fragment, useMemo, useState } from 'react';
import { ChevronDown, ChevronRight, Download, Search, Target, Trophy } from 'lucide-react';
import { api } from '../../lib/api.js';
import { useFetch } from '../../hooks/useFetch.js';
import { fmtDateTime } from '../../lib/format.js';
import { Badge, Banner, Button, Card, EmptyState, Input, PageHeader, Select, TableSkeleton, TableWrap, Tabs, Td, Th, useToast } from '../../components/ui.jsx';
import { EventSelect } from '../../components/admin.jsx';

// A thin bar: how much of the bucket was answered right.
function AccuracyBar({ value }) {
  const pct = Math.max(0, Math.min(100, Number(value) || 0));
  const tone = pct >= 70 ? 'bg-ok' : pct >= 40 ? 'bg-amber-500' : 'bg-danger';
  return (
    <span className="flex items-center gap-2">
      <span className="h-1.5 w-20 overflow-hidden rounded-full bg-slate-200" aria-hidden>
        <span className={`block h-full rounded-full ${tone}`} style={{ width: `${pct}%` }} />
      </span>
      <span className="tnum text-sm">{pct}%</span>
    </span>
  );
}

export default function Results() {
  const toast = useToast();
  const events = useFetch('/admin/events');
  const [eventId, setEventId] = useState(null);
  const { data, error, loading, reload } = useFetch(`/admin/results${eventId ? `?event_id=${eventId}` : ''}`);
  const analysis = useFetch(`/admin/analytics${eventId ? `?event_id=${eventId}` : ''}`);
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(new Set());
  const [exporting, setExporting] = useState(false);
  const [exportErr, setExportErr] = useState('');
  const [publishing, setPublishing] = useState(false);
  const [publishErr, setPublishErr] = useState('');
  const [expiry, setExpiry] = useState('7d');
  const [view, setView] = useState('skills');

  const rows = useMemo(() => (data?.results || []).filter((r) => !q || r.name.toLowerCase().includes(q.toLowerCase()) || r.email.includes(q.toLowerCase())), [data, q]);
  const toggle = (k) => setOpen((s) => { const n = new Set(s); n.has(k) ? n.delete(k) : n.add(k); return n; });

  // CSV comes from the server, not from the visible table.
  const exportCsv = async () => {
    setExporting(true); setExportErr('');
    try {
      const res = await api(`/admin/results.csv${eventId ? `?event_id=${eventId}` : ''}`, { role: 'admin', raw: true });
      const url = URL.createObjectURL(await res.blob());
      const a = document.createElement('a'); a.href = url; a.download = 'results.csv'; document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      toast('CSV downloaded.');
    } catch (e) { setExportErr(`CSV export failed. ${e.message}`); } finally { setExporting(false); }
  };

  const exportCompetency = async () => {
    setExporting(true); setExportErr('');
    try {
      const res = await api(`/admin/analytics.csv${eventId ? `?event_id=${eventId}` : ''}`, { role: 'admin', raw: true });
      const url = URL.createObjectURL(await res.blob());
      const a = document.createElement('a'); a.href = url; a.download = 'competency.csv'; document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      toast('Competency CSV downloaded.');
    } catch (e) { setExportErr(`Competency export failed. ${e.message}`); } finally { setExporting(false); }
  };

  const selectedEvent = (events.data?.events || []).find((event) => event.id === eventId) || null;
  const manual = selectedEvent?.results_visibility === 'manual';
  const published = !!selectedEvent?.results_published;
  const expired = !!selectedEvent?.results_expires_at && Date.parse(selectedEvent.results_expires_at) <= Date.now();

  const resultAction = async (action) => {
    if (!selectedEvent) return;
    setPublishing(true);
    setPublishErr('');
    try {
      const suffix = action === 'publish' ? 'publish-results' : `results/${action}`;
      await api(`/admin/events/${selectedEvent.id}/${suffix}`, {
        method: 'POST',
        role: 'admin',
        body: action === 'unpublish' ? {} : { preset: expiry },
      });
      await events.reload();
      await reload();
      toast({
        publish: 'Results published.',
        extend: 'Result window extended.',
        unpublish: 'Results hidden again.',
      }[action]);
    } catch (e) {
      setPublishErr(e.message);
    } finally {
      setPublishing(false);
    }
  };

  const cohort = analysis.data;
  const cohortRows = view === 'skills' ? cohort?.skills || [] : cohort?.difficulties || [];

  return (
    <>
      <PageHeader title="Results" description="Ranking and scores are calculated by the server."
        actions={<>{events.data && <EventSelect events={events.data.events} value={eventId} onChange={setEventId} allLabel="All events" />}<Button variant="secondary" onClick={exportCsv} loading={exporting}><Download size={14} />Export CSV</Button></>} />
      {exportErr && <Banner tone="error" className="mb-3">{exportErr}</Banner>}

      {eventId && selectedEvent && (
        <Card className="mb-4">
          <div className="flex flex-wrap items-center justify-between gap-3 p-4">
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium">Student results</p>
                <Badge tone={!manual ? 'neutral' : published && !expired ? 'ok' : 'warn'}>
                  {!manual
                    ? { immediate: 'Immediate', after_all_submitted: 'After all submit', never: 'Hidden' }[selectedEvent.results_visibility]
                    : expired
                      ? 'Expired'
                      : published
                        ? 'Published'
                        : 'Hidden'}
                </Badge>
              </div>
              <p className="mt-1 text-xs text-muted">
                {!manual
                  ? {
                    immediate: 'Students see their score as soon as they submit.',
                    after_all_submitted: 'Students see their score after every paper is submitted.',
                    never: 'Students never see their score. Admins can still export it.',
                  }[selectedEvent.results_visibility]
                  : published
                    ? expired
                      ? `The result window closed ${fmtDateTime(selectedEvent.results_expires_at)}. Extend it or unpublish.`
                      : `Students can view their score until ${fmtDateTime(selectedEvent.results_expires_at)}.`
                    : 'Publish once every paper is submitted, then choose how long students can view it.'}
              </p>
            </div>
            {manual && (
              <div className="flex flex-wrap items-center gap-2">
                <Select aria-label="Result window" value={expiry} onChange={(e) => setExpiry(e.target.value)} className="h-9 w-40 text-sm">
                  <option value="1h">1 hour</option>
                  <option value="6h">6 hours</option>
                  <option value="1d">1 day</option>
                  <option value="7d">7 days</option>
                  <option value="14d">14 days</option>
                  <option value="30d">30 days</option>
                </Select>
                {!published ? (
                  <Button onClick={() => resultAction('publish')} loading={publishing}>Publish results</Button>
                ) : (
                  <>
                    <Button variant="secondary" onClick={() => resultAction('extend')} loading={publishing}>Extend</Button>
                    <Button variant="ghost" onClick={() => resultAction('unpublish')} loading={publishing}>Unpublish</Button>
                  </>
                )}
              </div>
            )}
          </div>
          {publishErr && <div className="px-4 pb-4"><Banner tone="error">{publishErr}</Banner></div>}
        </Card>
      )}

      {/* What the exam measured, across everyone who submitted it. */}
      <Card className="mb-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line p-3">
          <div className="flex items-center gap-2 px-1">
            <Target size={16} className="text-muted" aria-hidden />
            <p className="text-sm font-medium">Competency</p>
            {cohort && (
              <span className="tnum text-sm text-muted">
                ({cohort.students} submitted{cohort.analysed < cohort.students ? `, ${cohort.analysed} analysed` : ''})
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Tabs label="Competency view" value={view} onChange={setView} items={[['skills', 'By skill'], ['difficulties', 'By difficulty']]} />
            <Button variant="ghost" size="sm" onClick={exportCompetency} disabled={!cohort?.skills?.length}><Download size={14} />CSV</Button>
          </div>
        </div>
        {analysis.error && <div className="p-4"><Banner tone="error" title="Could not load the competency analysis." action={<Button size="sm" variant="secondary" onClick={analysis.reload}>Retry</Button>}>{analysis.error.message}</Banner></div>}
        {!analysis.error && cohortRows.length === 0 && (
          <EmptyState icon={<Target size={20} />} title="Nothing to analyse yet">
            The competency of a submission appears once a student answers an exam whose questions carry a skill.
          </EmptyState>
        )}
        {cohortRows.length > 0 && (
          <TableWrap>
            <thead>
              <tr>
                <Th>{view === 'skills' ? 'Skill' : 'Difficulty'}</Th>
                {view === 'skills' && <Th>Category</Th>}
                <Th className="text-right">Answered</Th>
                <Th className="text-right">Correct</Th>
                <Th>Accuracy</Th>
              </tr>
            </thead>
            <tbody>
              {cohortRows.map((row) => (
                <tr key={view === 'skills' ? row.code ?? 'untagged' : `level-${row.level}`}>
                  <Td className="font-medium">{row.name || row.label}</Td>
                  {view === 'skills' && <Td className="text-muted">{row.category || '—'}</Td>}
                  <Td className="tnum text-right">{row.answered} / {row.total}</Td>
                  <Td className="tnum text-right">{row.correct} / {row.total}</Td>
                  <Td><AccuracyBar value={row.accuracy} /></Td>
                </tr>
              ))}
            </tbody>
          </TableWrap>
        )}
      </Card>

      <Card>
        <div className="flex items-center justify-between border-b border-line p-3">
          <p className="px-1 text-sm font-medium">Leaderboard <span className="tnum text-muted">({q ? `${rows.length} of ${data?.results.length ?? '…'}` : (data?.results.length ?? '…')})</span></p>
          <div className="relative"><Search size={14} className="pointer-events-none absolute left-3 top-3 text-slate-400" aria-hidden /><Input aria-label="Search results" placeholder="Search name or email" value={q} onChange={(e) => setQ(e.target.value)} className="h-9 w-56 pl-8 text-sm" /></div>
        </div>
        {loading && !data && <TableSkeleton />}
        {error && <div className="p-4"><Banner tone="error" title="Could not load results." action={<Button size="sm" variant="secondary" onClick={reload}>Retry</Button>}>{error.message}</Banner></div>}
        {data && data.results.length === 0 && <EmptyState icon={<Trophy size={20} />} title="No submissions yet">{eventId ? 'Nobody has submitted this exam yet.' : 'Results appear here as soon as students submit.'}</EmptyState>}
        {data && data.results.length > 0 && rows.length === 0 && <EmptyState title="No matches">No result matches “{q}”.</EmptyState>}
        {rows.length > 0 && (
          <TableWrap>
            <thead><tr><Th>Rank</Th><Th>Student</Th><Th className="text-right">Score</Th><Th>Breakdown</Th><Th>Submitted</Th></tr></thead>
            <tbody>
              {rows.map((r) => {
                const k = `${r.event_id}:${r.email}`;
                const isOpen = open.has(k);
                return (
                  <Fragment key={k}>
                    <tr>
                      <Td className="tnum font-medium">{r.rank}</Td>
                      <Td><p className="font-medium">{r.name}</p><p className="text-xs text-muted">{r.email}</p></Td>
                      <Td className="tnum text-right font-medium">{r.total}<span className="text-muted"> / {r.max}</span></Td>
                      <Td><button onClick={() => toggle(k)} aria-expanded={isOpen} className="inline-flex items-center gap-1 text-sm text-primary hover:underline">{isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}Breakdown</button></Td>
                      <Td className="tnum whitespace-nowrap text-muted">{fmtDateTime(r.submitted_at)}{r.submit_reason !== 'student' && <Badge tone="warn" className="ml-2">{{ max_warnings: 'Auto: warnings', time_expired: 'Auto: time', force_submit: 'Forced', integrity_lockout: 'Locked: integrity' }[r.submit_reason]}</Badge>}</Td>
                    </tr>
                    {isOpen && (
                      <tr>
                        <td colSpan={5} className="border-b border-line bg-slate-50/60 px-4 py-3">
                          <div className="tnum flex flex-wrap gap-x-8 gap-y-1 text-sm">
                            {r.sections.map((s) => <span key={s.name}><span className="text-muted">{s.name}</span> <span className="font-medium">{s.score}/{s.total}</span></span>)}
                          </div>
                          {(r.competency?.skills?.length ?? 0) > 0 && (
                            <div className="mt-2 flex flex-wrap gap-x-8 gap-y-1 text-sm">
                              {r.competency.skills.map((s) => (
                                <span key={s.code ?? 'untagged'}><span className="text-muted">{s.name}</span> <span className="font-medium">{s.correct}/{s.total}</span></span>
                              ))}
                            </div>
                          )}
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </TableWrap>
        )}
      </Card>
    </>
  );
}
