import { useMemo, useState } from 'react';
import { CalendarDays, Plus, Trash2 } from 'lucide-react';
import { api } from '../../lib/api.js';
import { useFetch } from '../../hooks/useFetch.js';
import { fmtDateTime, fmtDuration } from '../../lib/format.js';
import { Banner, Button, Card, EmptyState, Field, Input, Modal, PageHeader, Select, TableSkeleton, TableWrap, Tabs, Td, Th, useToast } from '../../components/ui.jsx';
import { RosterBadge, StatusBadge, eventStatus } from '../../components/admin.jsx';

function CreateEvent({ open, onClose, onCreated, categories }) {
  const toast = useToast();
  const blank = {
    name: '',
    starts_at: '',
    duration_min: 60,
    rows: [{ category: '', count: 5 }],
    domain_mode: 'fixed',
    common: ['Aptitude', 'Logic'],
    allowed: [],
    min: 1,
    max: 1,
  };
  const [f, setF] = useState(blank);
  const [errs, setErrs] = useState({});
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const total = f.rows.reduce((a, r) => a + (Number(r.count) > 0 ? Number(r.count) : 0), 0);
  const avail = Object.fromEntries(categories.map((c) => [c.name, c.count]));

  const setRow = (i, patch) => setF((s) => ({ ...s, rows: s.rows.map((r, j) => (j === i ? { ...r, ...patch } : r)) }));

  const selectMode = (mode) => setF((s) => ({ ...s, domain_mode: mode }));

  const toggleIn = (list, code) => (list.includes(code) ? list.filter((c) => c !== code) : [...list, code]);

  const toggleCommon = (code) =>
    setF((s) => ({
      ...s,
      common: toggleIn(s.common, code),
      // A category cannot be common and selectable at the same time.
      allowed: s.allowed.filter((c) => c !== code),
    }));

  const toggleAllowed = (code) =>
    setF((s) => ({
      ...s,
      allowed: toggleIn(s.allowed, code),
      common: s.common.filter((c) => c !== code),
    }));

  // The categories that carry a question count can take a role in the domain
  // selection - a category without a count cannot be offered.
  const configured = f.rows.filter((r) => r.category && Number(r.count) > 0).map((r) => r.category);

  const submit = async (e) => {
    e.preventDefault();
    const x = {};
    if (!f.name.trim()) x.name = 'Event name is required.';
    if (!f.starts_at) x.starts_at = 'Choose a start date and time.';
    if (!(Number(f.duration_min) > 0)) x.duration_min = 'Duration must be greater than 0.';
    const used = f.rows.filter((r) => r.category);
    if (!used.length) x.config = 'Add at least one category.';
    else if (new Set(used.map((r) => r.category)).size !== used.length) x.config = 'Each category can only be used once.';
    else if (used.some((r) => !(Number(r.count) > 0))) x.config = 'Question counts must be at least 1.';

    if (f.domain_mode === 'select') {
      if (!f.allowed.length) x.domain_rules = 'Choose at least one domain the student may pick.';
      else if (Number(f.max) < Number(f.min)) x.domain_rules = 'The maximum number of domains must not be smaller than the minimum.';
      else if (Number(f.min) < 1) x.domain_rules = 'The student must pick at least one domain.';
      else if ([...f.common, ...f.allowed].some((c) => !configured.includes(c))) {
        x.domain_rules = 'Every common category and every selectable domain needs a question count.';
      }
    }
    setErrs(x); setErr('');
    if (Object.keys(x).length) return;
    setBusy(true);
    try {
      await api('/admin/events', {
        method: 'POST',
        role: 'admin',
        body: {
          name: f.name.trim(),
          starts_at: new Date(f.starts_at).toISOString(),
          duration_min: Number(f.duration_min),
          config: Object.fromEntries(used.map((r) => [r.category, Number(r.count)])),
          domain_mode: f.domain_mode,
          domain_rules:
            f.domain_mode === 'select'
              ? { common: f.common, allowed: f.allowed, min: Number(f.min), max: Number(f.max) }
              : {},
        },
      });
      toast('Event created.'); setF(blank); onCreated(); onClose();
    } catch (ex) { setErr(ex.message); if (ex.data?.fields) setErrs(ex.data.fields); } finally { setBusy(false); }
  };

  return (
    <Modal open={open} onClose={onClose} title="Create event" size="lg">
      <form onSubmit={submit} noValidate className="space-y-4">
        {err && <Banner tone="error">{err}</Banner>}
        <Field label="Event name" error={errs.name}>{(p) => <Input {...p} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />}</Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Start date and time" error={errs.starts_at}>{(p) => <Input {...p} type="datetime-local" value={f.starts_at} onChange={(e) => setF({ ...f, starts_at: e.target.value })} className="tnum" />}</Field>
          <Field label="Duration (minutes)" error={errs.duration_min}>{(p) => <Input {...p} type="number" min={1} value={f.duration_min} onChange={(e) => setF({ ...f, duration_min: e.target.value })} className="tnum" />}</Field>
        </div>
        <fieldset>
          <legend className="mb-1.5 text-[13px] font-medium">Categories and question counts</legend>
          <div className="space-y-2">
            {f.rows.map((r, i) => (
              <div key={i} className="flex items-center gap-2">
                <Select aria-label={`Category ${i + 1}`} value={r.category} onChange={(e) => setRow(i, { category: e.target.value })} className="flex-1">
                  <option value="">Select category…</option>
                  {categories.map((c) => <option key={c.name} value={c.name}>{c.name} ({c.count} questions)</option>)}
                </Select>
                <Input aria-label={`Question count ${i + 1}`} type="number" min={1} value={r.count} onChange={(e) => setRow(i, { count: e.target.value })} className="tnum w-24" />
                <Button type="button" variant="ghost" size="sm" aria-label={`Remove category row ${i + 1}`} onClick={() => setF((s) => ({ ...s, rows: s.rows.filter((_, j) => j !== i) }))} disabled={f.rows.length === 1}><Trash2 size={14} /></Button>
              </div>
            ))}
          </div>
          {f.rows.filter((r) => r.category && Number(r.count) > (avail[r.category] ?? 0)).map((r) => (
            <p key={r.category} className="mt-2 text-xs text-amber-700">{r.category}: you asked for {r.count} but the bank has only {avail[r.category]} questions. Students would see an “insufficient questions” error.</p>
          ))}
          {errs.config && <p role="alert" className="mt-2 text-xs text-danger">{errs.config}</p>}
          <div className="mt-2 flex items-center justify-between">
            <Button type="button" variant="secondary" size="sm" onClick={() => setF((s) => ({ ...s, rows: [...s.rows, { category: '', count: 5 }] }))}><Plus size={14} />Add category</Button>
            <p className="tnum text-sm text-muted">Total questions: <span className="font-medium text-ink">{total}</span></p>
          </div>
        </fieldset>

        {/* Domain selection: the student picks the technical domain(s) the exam
            asks about, in the waiting room, before the timer starts. */}
        <fieldset>
          <legend className="mb-1.5 text-[13px] font-medium">Domain selection</legend>
          <Select aria-label="Domain selection mode" value={f.domain_mode} onChange={(e) => selectMode(e.target.value)}>
            <option value="fixed">Fixed categories — everyone gets the same questions</option>
            <option value="select">Student chooses their technical domain</option>
          </Select>

          {f.domain_mode === 'select' && (
            <div className="mt-3 space-y-3">
              {!configured.length && (
                <p className="text-xs text-amber-700">Add a category with a question count first — a domain without questions cannot be offered.</p>
              )}

              <div>
                <p className="text-[13px] font-medium">Always included</p>
                <p className="text-xs text-muted">These categories are part of every paper, whatever the student picks.</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {configured.map((code) => (
                    <button
                      key={code}
                      type="button"
                      onClick={() => toggleCommon(code)}
                      aria-pressed={f.common.includes(code)}
                      className={[
                        'rounded-md border px-3 py-1.5 text-sm transition',
                        f.common.includes(code)
                          ? 'border-primary bg-primary-soft/60 text-ink'
                          : 'border-line bg-white text-muted hover:border-primary/40',
                      ].join(' ')}
                    >
                      {code}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-[13px] font-medium">Domains the student may choose</p>
                <p className="text-xs text-muted">The student picks from these in the waiting room, before the timer starts.</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {configured.map((code) => (
                    <button
                      key={code}
                      type="button"
                      onClick={() => toggleAllowed(code)}
                      aria-pressed={f.allowed.includes(code)}
                      className={[
                        'rounded-md border px-3 py-1.5 text-sm transition',
                        f.allowed.includes(code)
                          ? 'border-primary bg-primary-soft/60 text-ink'
                          : 'border-line bg-white text-muted hover:border-primary/40',
                      ].join(' ')}
                    >
                      {code}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Domains to pick (minimum)" error={errs.domain_rules}>{(p) => <Input {...p} type="number" min={1} value={f.min} onChange={(e) => setF({ ...f, min: e.target.value })} className="tnum" />}</Field>
                <Field label="Domains to pick (maximum)">{(p) => <Input {...p} type="number" min={1} value={f.max} onChange={(e) => setF({ ...f, max: e.target.value })} className="tnum" />}</Field>
              </div>
              {errs.domain_rules && <p role="alert" className="text-xs text-danger">{errs.domain_rules}</p>}
              <p className="text-xs text-muted">
                A student picks {f.min === f.max ? f.min : `${f.min} to ${f.max}`} domain{f.max === 1 ? '' : 's'}. The paper holds the common questions plus the count of every domain picked.
              </p>
            </div>
          )}
        </fieldset>

        <div className="flex justify-end gap-2 border-t border-line pt-3">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={busy}>Create event</Button>
        </div>
      </form>
    </Modal>
  );
}

export default function Events() {
  const { data, error, loading, reload } = useFetch('/admin/events');
  const cats = useFetch('/bank/categories');
  const [filter, setFilter] = useState('all');
  const [open, setOpen] = useState(false);

  const rows = useMemo(() => (data?.events || []).filter((e) => filter === 'all' || eventStatus(e) === filter), [data, filter]);

  return (
    <>
      <PageHeader title="Events" description="Exam events, their question configuration and roster freshness."
        actions={<Button onClick={() => setOpen(true)}><Plus size={16} />Create event</Button>} />
      <div className="mb-3"><Tabs label="Filter by status" value={filter} onChange={setFilter} items={[['all', 'All'], ['upcoming', 'Upcoming'], ['ongoing', 'Ongoing'], ['completed', 'Completed']]} /></div>
      <Card>
        {loading && !data && <TableSkeleton />}
        {error && !data && <div className="p-4"><Banner tone="error" title="Could not load events." action={<Button size="sm" variant="secondary" onClick={reload}>Retry</Button>}>{error.message}</Banner></div>}
        {data && rows.length === 0 && (
          <EmptyState icon={<CalendarDays size={20} />} title={filter === 'all' ? 'No exam events yet' : `No ${filter} events`}
            action={filter === 'all' && <Button onClick={() => setOpen(true)}><Plus size={16} />Create event</Button>}>
            {filter === 'all' ? 'Create an event, then import its roster.' : 'Try another status filter.'}
          </EmptyState>
        )}
        {data && rows.length > 0 && (
          <TableWrap>
            <thead><tr><Th>Name</Th><Th>Start time</Th><Th>Duration</Th><Th>Categories</Th><Th>Roster</Th><Th>Status</Th></tr></thead>
            <tbody>
              {rows.map((e) => {
                const cs = Object.entries(e.config);
                return (
                  <tr key={e.id}>
                    <Td className="font-medium">{e.name}</Td>
                    <Td className="tnum whitespace-nowrap">{fmtDateTime(e.starts_at)}</Td>
                    <Td className="tnum">{fmtDuration(e.duration_min)}</Td>
                    <Td>
                      <span title={cs.map(([k, v]) => `${k}: ${v}`).join(', ')}>{cs[0]?.[0]}{cs.length > 1 ? ` + ${cs.length - 1}` : ''} <span className="tnum text-muted">· {e.total_questions} Q</span></span>
                      {e.domain_mode === 'select' && (
                        <span className="mt-1 block text-xs text-primary">
                          Student picks {e.domain_rules?.min === e.domain_rules?.max ? e.domain_rules?.min : `${e.domain_rules?.min}–${e.domain_rules?.max}`} of {e.domain_rules?.allowed?.length || 0} domains
                        </span>
                      )}
                    </Td>
                    <Td><div className="flex flex-col items-start gap-1"><RosterBadge ev={e} /><span className="tnum text-xs text-muted">{e.roster_count} students{e.roster_updated_at ? ` · ${fmtDateTime(e.roster_updated_at)}` : ''}</span></div></Td>
                    <Td><StatusBadge status={eventStatus(e)} /></Td>
                  </tr>
                );
              })}
            </tbody>
          </TableWrap>
        )}
      </Card>
      <p className="mt-3 text-xs text-muted">Editing an existing event is not available: the API only supports listing and creating events.</p>
      <CreateEvent open={open} onClose={() => setOpen(false)} onCreated={reload} categories={cats.data?.categories || []} />
    </>
  );
}
