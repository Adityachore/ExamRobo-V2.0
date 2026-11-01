import { useMemo, useState } from 'react';
import { CalendarDays, Pencil, Plus, Trash2 } from 'lucide-react';
import { api } from '../../lib/api.js';
import { useFetch } from '../../hooks/useFetch.js';
import { fmtDateTime, fmtDuration } from '../../lib/format.js';
import { Badge, Banner, Button, Card, ConfirmDialog, EmptyState, Field, Input, Modal, PageHeader, Select, TableSkeleton, TableWrap, Tabs, Td, Textarea, Th, useToast } from '../../components/ui.jsx';
import { RosterBadge, StatusBadge, eventStatus } from '../../components/admin.jsx';

const toLocalInput = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
};

const positive = (value) => {
  const n = Number(value);
  return Number.isInteger(n) && n > 0 ? n : 0;
};

function rowsFromEvent(event) {
  const config = event?.config || event?.question_counts || {};
  const limits = event?.section_limits || {};
  const categories = Object.keys(config);
  if (!categories.length) return [{ category: '', count: 5, limit: 30 }];
  const total = categories.reduce((sum, code) => sum + positive(config[code]), 0) || 1;
  const duration = positive(event?.duration_min) || 60;
  return categories.map((code) => ({
    category: code,
    count: positive(config[code]) || 1,
    limit: positive(limits[code]) || Math.max(1, Math.round((duration * positive(config[code])) / total)),
  }));
}

function blankEvent() {
  return {
    name: '',
    starts_at: '',
    instructions: 'Stay in fullscreen. Do not switch tabs.',
    rows: [{ category: '', count: 5, limit: 30 }],
    eventWindow: 60,
    results_visibility: 'manual',
    domain_mode: 'fixed',
    common: [],
    allowed: [],
    min: 1,
    max: 1,
  };
}

function limitFor(f, code) {
  const row = f.rows.find((r) => r.category === code);
  return positive(row?.limit);
}

function computedDuration(f) {
  if (f.domain_mode !== 'select') {
    return f.rows.reduce((sum, row) => sum + positive(row.limit), 0);
  }
  const common = f.common.reduce((sum, code) => sum + limitFor(f, code), 0);
  const allowed = f.allowed
    .map((code) => limitFor(f, code))
    .sort((a, b) => b - a)
    .slice(0, positive(f.max));
  return common + allowed.reduce((sum, value) => sum + value, 0);
}

function EventForm({ open, onClose, onSaved, categories, event }) {
  const toast = useToast();
  const [f, setF] = useState(() => (event ? {
    name: event.name,
    starts_at: toLocalInput(event.starts_at),
    instructions: event.instructions || '',
    rows: rowsFromEvent(event),
    eventWindow: positive(event.duration_min) || 60,
    results_visibility: event.results_visibility || 'manual',
    domain_mode: event.domain_mode || 'fixed',
    common: event.domain_rules?.common || [],
    allowed: event.domain_rules?.allowed || [],
    min: event.domain_rules?.min || 1,
    max: event.domain_rules?.max || 1,
  } : blankEvent()));
  const [errs, setErrs] = useState({});
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const avail = Object.fromEntries(categories.map((c) => [c.name, c.count]));
  const configured = f.rows.filter((r) => r.category && positive(r.count) > 0).map((r) => r.category);
  const totalQuestions = f.rows.reduce((sum, row) => sum + positive(row.count), 0);
  const paperMax = computedDuration(f);

  const setRow = (i, patch) => setF((s) => ({
    ...s,
    rows: s.rows.map((row, j) => (j === i ? { ...row, ...patch } : row)),
  }));
  const toggleIn = (list, code) => (list.includes(code) ? list.filter((c) => c !== code) : [...list, code]);
  const toggleCommon = (code) => setF((s) => ({
    ...s,
    common: toggleIn(s.common, code),
    allowed: s.allowed.filter((c) => c !== code),
  }));
  const toggleAllowed = (code) => setF((s) => ({
    ...s,
    allowed: toggleIn(s.allowed, code),
    common: s.common.filter((c) => c !== code),
  }));

  const submit = async (e) => {
    e.preventDefault();
    const next = {};
    if (!f.name.trim()) next.name = 'Event name is required.';
    if (!f.starts_at) next.starts_at = 'Choose a start date and time.';
    const used = f.rows.filter((row) => row.category);
    if (!used.length) next.config = 'Add at least one category.';
    else if (new Set(used.map((row) => row.category)).size !== used.length) next.config = 'Each category can only be used once.';
    else if (used.some((row) => !(positive(row.count) > 0))) next.config = 'Question counts must be at least 1.';
    if (used.some((row) => !(positive(row.limit) > 0))) next.section_limits = 'Give every section a time limit.';
    if (!f.instructions.trim()) next.instructions = 'Instructions are required.';
    if (!(positive(f.eventWindow) > 0)) next.duration_min = 'Give the event window at least 1 minute.';

    if (f.domain_mode === 'select') {
      if (!f.allowed.length) next.domain_rules = 'Choose at least one domain the student may pick.';
      else if (positive(f.min) < 1) next.domain_rules = 'The student must pick at least one domain.';
      else if (positive(f.max) < positive(f.min)) next.domain_rules = 'The maximum must not be smaller than the minimum.';
      else if (positive(f.max) > f.allowed.length) next.domain_rules = 'The maximum cannot exceed the number of selectable domains.';
      else if (configured.some((code) => !f.common.includes(code) && !f.allowed.includes(code))) {
        next.domain_rules = 'Every configured category must be either common or selectable.';
      }
    }

    setErrs(next);
    setErr('');
    if (Object.keys(next).length) return;
    setBusy(true);
    try {
      const body = {
        name: f.name.trim(),
        starts_at: new Date(f.starts_at).toISOString(),
        instructions: f.instructions.trim(),
        duration_min: positive(f.eventWindow),
        results_visibility: f.results_visibility,
        config: Object.fromEntries(used.map((row) => [row.category, positive(row.count)])),
        section_limits: Object.fromEntries(used.map((row) => [row.category, positive(row.limit)])),
        domain_mode: f.domain_mode,
        domain_rules: f.domain_mode === 'select'
          ? { common: f.common, allowed: f.allowed, min: positive(f.min), max: positive(f.max) }
          : {},
      };
      await api(event ? `/admin/events/${event.id}` : '/admin/events', {
        method: event ? 'PATCH' : 'POST',
        role: 'admin',
        body,
      });
      toast(event ? 'Event updated.' : 'Event created.');
      onSaved();
      onClose();
    } catch (ex) {
      setErr(ex.message);
      if (ex.data?.fields) setErrs(ex.data.fields);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={event ? 'Edit event' : 'Create event'} size="lg">
      <form onSubmit={submit} noValidate className="space-y-4">
        {err && <Banner tone="error">{err}</Banner>}
        <Field label="Event name" error={errs.name}>
          {(p) => <Input {...p} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />}
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Start date and time" error={errs.starts_at}>
            {(p) => <Input {...p} type="datetime-local" value={f.starts_at} onChange={(e) => setF({ ...f, starts_at: e.target.value })} className="tnum" />}
          </Field>
          <Field label="Event window" error={errs.duration_min}>
            {(p) => <Input {...p} type="number" min={1} value={f.eventWindow} onChange={(e) => setF({ ...f, eventWindow: e.target.value })} className="tnum" />}
          </Field>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Results for students">
            {(p) => (
              <Select {...p} value={f.results_visibility} onChange={(e) => setF({ ...f, results_visibility: e.target.value })}>
                <option value="manual">Publish manually</option>
                <option value="after_all_submitted">After every student submits</option>
                <option value="immediate">Immediately after each submission</option>
                <option value="never">Never show to students</option>
              </Select>
            )}
          </Field>
          <div className="flex items-end pb-1 text-xs text-muted">
            Students must start within the event window. A paper gets the full {fmtDuration(paperMax)} of its section limits, even when it starts late.
          </div>
        </div>
        <Field label="Instructions" error={errs.instructions}>
          {(p) => <Textarea {...p} rows={3} value={f.instructions} onChange={(e) => setF({ ...f, instructions: e.target.value })} />}
        </Field>

        <fieldset>
          <legend className="mb-1.5 text-[13px] font-medium">Categories, questions and section time</legend>
          <div className="space-y-2">
            {f.rows.map((row, i) => (
              <div key={i} className="grid grid-cols-[1fr_5.5rem_6.5rem_2rem] items-center gap-2">
                <Select aria-label={`Category ${i + 1}`} value={row.category} onChange={(e) => setRow(i, { category: e.target.value })}>
                  <option value="">Select category</option>
                  {categories.map((c) => <option key={c.name} value={c.name}>{c.name} ({c.count} questions)</option>)}
                </Select>
                <Input aria-label={`Question count ${i + 1}`} type="number" min={1} value={row.count} onChange={(e) => setRow(i, { count: e.target.value })} className="tnum" />
                <div className="relative">
                  <Input aria-label={`Minutes for section ${i + 1}`} type="number" min={1} value={row.limit} onChange={(e) => setRow(i, { limit: e.target.value })} className="tnum pr-8" />
                  <span className="pointer-events-none absolute right-2.5 top-3.5 text-xs text-muted">min</span>
                </div>
                <Button type="button" variant="ghost" size="sm" aria-label={`Remove category row ${i + 1}`} onClick={() => setF((s) => ({ ...s, rows: s.rows.filter((_, j) => j !== i) }))} disabled={f.rows.length === 1}><Trash2 size={14} /></Button>
              </div>
            ))}
          </div>
          {f.rows.filter((row) => row.category && positive(row.count) > (avail[row.category] ?? 0)).map((row) => (
            <p key={row.category} className="mt-2 text-xs text-amber-700">{row.category}: you asked for {row.count} but the bank has only {avail[row.category]} questions.</p>
          ))}
          {(errs.config || errs.section_limits) && <p role="alert" className="mt-2 text-xs text-danger">{errs.config || errs.section_limits}</p>}
          <div className="mt-2 flex items-center justify-between gap-3">
            <Button type="button" variant="secondary" size="sm" onClick={() => setF((s) => ({ ...s, rows: [...s.rows, { category: '', count: 5, limit: 15 }] }))}><Plus size={14} />Add category</Button>
            <p className="tnum text-sm text-muted">Total questions: <span className="font-medium text-ink">{totalQuestions}</span></p>
          </div>
        </fieldset>

        <fieldset>
          <legend className="mb-1.5 text-[13px] font-medium">Domain selection</legend>
          <Select aria-label="Domain selection mode" value={f.domain_mode} onChange={(e) => setF({ ...f, domain_mode: e.target.value })}>
            <option value="fixed">Fixed categories - everyone gets the same sections</option>
            <option value="select">Student chooses their technical domain</option>
          </Select>

          {f.domain_mode === 'select' && (
            <div className="mt-3 space-y-3">
              {!configured.length && <p className="text-xs text-amber-700">Add a category with a question count first.</p>}
              <div>
                <p className="text-[13px] font-medium">Always included</p>
                <p className="text-xs text-muted">Every student gets these sections.</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {configured.map((code) => (
                    <button key={code} type="button" onClick={() => toggleCommon(code)} aria-pressed={f.common.includes(code)}
                      className={['rounded-md border px-3 py-1.5 text-sm transition', f.common.includes(code) ? 'border-primary bg-primary-soft/60 text-ink' : 'border-line bg-white text-muted hover:border-primary/40'].join(' ')}>{code}</button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[13px] font-medium">Domains the student may choose</p>
                <p className="text-xs text-muted">The student picks before the timer starts.</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {configured.map((code) => (
                    <button key={code} type="button" onClick={() => toggleAllowed(code)} aria-pressed={f.allowed.includes(code)}
                      className={['rounded-md border px-3 py-1.5 text-sm transition', f.allowed.includes(code) ? 'border-primary bg-primary-soft/60 text-ink' : 'border-line bg-white text-muted hover:border-primary/40'].join(' ')}>{code}</button>
                  ))}
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Minimum domains" error={errs.domain_rules}>
                  {(p) => <Input {...p} type="number" min={1} value={f.min} onChange={(e) => setF({ ...f, min: e.target.value })} className="tnum" />}
                </Field>
                <Field label="Maximum domains">
                  {(p) => <Input {...p} type="number" min={1} value={f.max} onChange={(e) => setF({ ...f, max: e.target.value })} className="tnum" />}
                </Field>
              </div>
              {errs.domain_rules && <p role="alert" className="text-xs text-danger">{errs.domain_rules}</p>}
              <p className="text-xs text-muted">
                A paper gets the full time of the sections the student actually receives. The event window only controls when a paper may start.
              </p>
            </div>
          )}
        </fieldset>

        <div className="flex justify-end gap-2 border-t border-line pt-3">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={busy}>{event ? 'Save changes' : 'Create event'}</Button>
        </div>
      </form>
    </Modal>
  );
}

function DeleteEvent({ event, onClose, onDeleted }) {
  const toast = useToast();
  const [name, setName] = useState('');
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const remove = async () => {
    if (name !== event.name) { setErr('Type the event name exactly.'); return; }
    setBusy(true); setErr('');
    try {
      const r = await api(`/admin/events/${event.id}`, {
        method: 'DELETE',
        role: 'admin',
        body: { confirm_name: name, reason },
      });
      toast(r.ended_papers
        ? `Event archived. ${r.ended_papers} active ${r.ended_papers === 1 ? 'attempt was' : 'attempts were'} ended.`
        : 'Event archived.');
      onDeleted();
      onClose();
    } catch (ex) {
      setErr(ex.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <ConfirmDialog open={!!event} onClose={onClose} onConfirm={remove} loading={busy} error={err}
      danger confirmLabel="Archive event" title={`Delete "${event.name}"?`}
      description="The event is archived, not destroyed: papers, results, warnings and recordings are kept. It disappears from Roster, Live and Results and is shown under Completed. Students who are still writing are signed out and their attempt is ended. Type the event name to confirm.">
      <Field label="Event name">
        {(p) => <Input {...p} value={name} onChange={(e) => setName(e.target.value)} autoComplete="off" />}
      </Field>
      <Field label="Reason (optional)" hint="Stored with the event and shown in the Completed tab.">
        {(p) => <Input {...p} value={reason} onChange={(e) => setReason(e.target.value)} maxLength={500} placeholder="Why is this event being archived?" />}
      </Field>
    </ConfirmDialog>
  );
}

export default function Events() {
  const { data, error, loading, reload } = useFetch('/admin/events?include_deleted=1');
  const cats = useFetch('/bank/categories');
  const [filter, setFilter] = useState('all');
  const [form, setForm] = useState({ open: false, event: null });
  const [deleting, setDeleting] = useState(null);

  // Archived events belong to Completed only. "All" and the active filters are
  // for events that can still be worked on.
  const rows = useMemo(() => (data?.events || []).filter((e) => {
    if (e.deleted_at) return filter === 'completed';
    return filter === 'all' || eventStatus(e) === filter;
  }), [data, filter]);

  return (
    <>
      <PageHeader title="Events" description="Exam events, section timing and roster freshness."
        actions={<Button onClick={() => setForm({ open: true, event: null })}><Plus size={16} />Create event</Button>} />
      <div className="mb-3"><Tabs label="Filter by status" value={filter} onChange={setFilter} items={[['all', 'All'], ['upcoming', 'Upcoming'], ['ongoing', 'Ongoing'], ['completed', 'Completed']]} /></div>
      <Card>
        {loading && !data && <TableSkeleton />}
        {error && !data && <div className="p-4"><Banner tone="error" title="Could not load events." action={<Button size="sm" variant="secondary" onClick={reload}>Retry</Button>}>{error.message}</Banner></div>}
        {data && rows.length === 0 && (
          <EmptyState icon={<CalendarDays size={20} />} title={filter === 'all' ? 'No exam events yet' : `No ${filter} events`}
            action={filter === 'all' && <Button onClick={() => setForm({ open: true, event: null })}><Plus size={16} />Create event</Button>}>
            {filter === 'all' ? 'Create an event, then import its roster.' : 'Try another status filter.'}
          </EmptyState>
        )}
        {data && rows.length > 0 && (
          <TableWrap>
            <thead><tr><Th>Name</Th><Th>Start time</Th><Th>Window</Th><Th>Questions</Th><Th>Roster</Th><Th>Status</Th><Th><span className="sr-only">Actions</span></Th></tr></thead>
            <tbody>
              {rows.map((e) => {
                const cs = Object.entries(e.config);
                const range = e.min_questions !== e.max_questions ? `${e.min_questions}-${e.max_questions}` : String(e.max_questions);
                return (
                  <tr key={e.id}>
                    <Td className="font-medium">
                      <span className="flex flex-wrap items-center gap-2">{e.name}{e.deleted_at && <Badge tone="danger">Deleted</Badge>}</span>
                      {e.deleted_at && (
                        <span className="mt-0.5 block text-xs font-normal text-muted">
                          {fmtDateTime(e.deleted_at)}{e.deleted_by ? ` by ${e.deleted_by}` : ''}{e.delete_reason ? ` — ${e.delete_reason}` : ''}
                        </span>
                      )}
                    </Td>
                    <Td className="tnum whitespace-nowrap">{fmtDateTime(e.starts_at)}</Td>
                    <Td className="tnum">{fmtDuration(e.duration_min)}</Td>
                    <Td>
                      <span title={cs.map(([k, v]) => `${k}: ${v}`).join(', ')}>{cs[0]?.[0]}{cs.length > 1 ? ` + ${cs.length - 1}` : ''} <span className="tnum text-muted">{range} Q</span></span>
                      {e.domain_mode === 'select' && (
                        <span className="mt-1 block text-xs text-primary">
                          Pick {e.domain_rules?.min === e.domain_rules?.max ? e.domain_rules?.min : `${e.domain_rules?.min}-${e.domain_rules?.max}`} of {e.domain_rules?.allowed?.length || 0}
                        </span>
                      )}
                    </Td>
                    <Td><div className="flex flex-col items-start gap-1"><RosterBadge ev={e} /><span className="tnum text-xs text-muted">{e.roster_count} students{e.roster_updated_at ? ` - ${fmtDateTime(e.roster_updated_at)}` : ''}</span></div></Td>
                    <Td>{e.deleted_at ? <Badge tone="danger">Deleted</Badge> : <StatusBadge status={eventStatus(e)} />}</Td>
                    <Td>
                      <div className="flex justify-end gap-1">
                        {e.deleted_at ? (
                          <span className="px-2 text-xs text-muted">Archived</span>
                        ) : (
                          <>
                            <Button variant="ghost" size="sm" aria-label={`Edit ${e.name}`} disabled={e.has_started}
                              title={e.has_started ? 'Students have started this event; it can no longer be edited.' : 'Edit event'}
                              onClick={() => setForm({ open: true, event: e })}><Pencil size={14} /></Button>
                            <Button variant="ghost" size="sm" aria-label={`Delete ${e.name}`} onClick={() => setDeleting(e)}><Trash2 size={14} className="text-danger" /></Button>
                          </>
                        )}
                      </div>
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </TableWrap>
        )}
      </Card>
      <p className="mt-3 text-xs text-muted">Events can be edited until the first student starts. Deleting archives the event: papers, results and recordings are kept, and the archived record is listed under Completed.</p>
      {form.open && (
        <EventForm key={form.event?.id || 'new'} open={form.open} event={form.event}
          onClose={() => setForm({ open: false, event: null })} onSaved={reload}
          categories={cats.data?.categories || []} />
      )}
      {deleting && <DeleteEvent event={deleting} onClose={() => setDeleting(null)} onDeleted={reload} />}
    </>
  );
}
