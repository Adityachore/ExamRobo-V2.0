import { useEffect, useMemo, useRef, useState } from 'react';
import { Download, Pencil, Plus, Search, Trash2, Upload, Users } from 'lucide-react';
import { api } from '../../lib/api.js';
import { useFetch } from '../../hooks/useFetch.js';
import { fmtDateTime } from '../../lib/format.js';
import { Badge, Banner, Button, Card, ConfirmDialog, EmptyState, Field, Input, Modal, PageHeader, TableSkeleton, TableWrap, Td, Textarea, Th, useToast } from '../../components/ui.jsx';
import { EventSelect, RosterBadge } from '../../components/admin.jsx';

function AddStudent({ eventId, onSaved }) {
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const add = async (e) => {
    e.preventDefault();
    setBusy(true); setErr('');
    try {
      await api(`/admin/events/${eventId}/roster`, {
        method: 'POST',
        role: 'admin',
        body: { email: email.trim(), name: name.trim() },
      });
      toast('Student added.');
      setEmail(''); setName('');
      onSaved();
    } catch (ex) {
      setErr(ex.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={add} noValidate className="mb-4 flex flex-wrap items-end gap-2">
      <Field label="Email" error={err}>
        {(p) => <Input {...p} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="student@example.com" className="w-64" />}
      </Field>
      <Field label="Name">
        {(p) => <Input {...p} value={name} onChange={(e) => setName(e.target.value)} placeholder="Optional" className="w-48" />}
      </Field>
      <Button type="submit" loading={busy} className="h-11"><Plus size={14} />Add student</Button>
    </form>
  );
}

function EditStudent({ student, eventId, onClose, onSaved }) {
  const toast = useToast();
  const [email, setEmail] = useState(student?.email || '');
  const [name, setName] = useState(student?.name || '');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    setEmail(student?.email || '');
    setName(student?.name || '');
    setErr('');
  }, [student]);

  const save = async (e) => {
    e.preventDefault();
    setBusy(true); setErr('');
    try {
      await api(`/admin/events/${eventId}/roster/${encodeURIComponent(student.email)}`, {
        method: 'PATCH',
        role: 'admin',
        body: { email: email.trim(), name: name.trim() },
      });
      toast('Student updated.');
      onSaved();
      onClose();
    } catch (ex) {
      setErr(ex.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal open={!!student} onClose={onClose} title="Edit student" size="sm">
      <form onSubmit={save} noValidate className="space-y-3">
        {err && <Banner tone="error">{err}</Banner>}
        <Field label="Email" hint={student?.has_paper ? 'The email is locked because this student already has a paper.' : undefined}>
          {(p) => <Input {...p} type="email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={student?.has_paper} />}
        </Field>
        <Field label="Name">
          {(p) => <Input {...p} value={name} onChange={(e) => setName(e.target.value)} />}
        </Field>
        <div className="flex justify-end gap-2 border-t border-line pt-3">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={busy}>Save</Button>
        </div>
      </form>
    </Modal>
  );
}

function RemoveStudents({ target, eventId, onClose, onSaved }) {
  const toast = useToast();
  const list = target?.list || [];
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => { setReason(''); setErr(''); }, [target]);

  const remove = async () => {
    setBusy(true); setErr('');
    try {
      if (list.length === 1) {
        await api(`/admin/events/${eventId}/roster/${encodeURIComponent(list[0].email)}`, {
          method: 'DELETE',
          role: 'admin',
          body: { reason: reason.trim() || 'Removed by administrator.' },
        });
      } else {
        await api(`/admin/events/${eventId}/roster/remove`, {
          method: 'POST',
          role: 'admin',
          body: { emails: list.map((row) => row.email), reason: reason.trim() || 'Removed by administrator.' },
        });
      }
      toast(list.length === 1 ? 'Student removed.' : `${list.length} students removed.`);
      onSaved();
      onClose();
    } catch (ex) {
      setErr(ex.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <ConfirmDialog open={!!target} onClose={onClose} onConfirm={remove} loading={busy} error={err}
      danger confirmLabel={list.length === 1 ? 'Remove student' : `Remove ${list.length} students`}
      title={list.length === 1 ? `Remove ${list[0]?.name || list[0]?.email}?` : `Remove ${list.length} students?`}
      description="Their access is revoked immediately. An active exam is submitted with the current answers and the result is kept. Re-adding the email restores access, but does not reopen a submitted paper.">
      <Field label="Reason" hint="Shown in the audit log.">
        {(p) => <Textarea {...p} rows={2} value={reason} onChange={(e) => setReason(e.target.value)} />}
      </Field>
    </ConfirmDialog>
  );
}

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
  const [showRemoved, setShowRemoved] = useState(false);
  const [selected, setSelected] = useState(new Set());
  const [editing, setEditing] = useState(null);
  const [removing, setRemoving] = useState(null);
  const [downloadBusy, setDownloadBusy] = useState(false);
  const fileRef = useRef(null);

  useEffect(() => { if (eventId == null && events.data?.events?.length) setEventId(events.data.events[0].id); }, [events.data, eventId]);
  useEffect(() => {
    setSummary(null); setErr(''); setSelected(new Set()); setQ(''); setShowRemoved(false);
  }, [eventId]);

  const ev = events.data?.events.find((e) => e.id === eventId);
  const visible = useMemo(() => (roster.data?.roster || [])
    .filter((r) => showRemoved || !r.removed)
    .filter((r) => !q || r.email.includes(q.toLowerCase()) || String(r.name || '').toLowerCase().includes(q.toLowerCase())), [roster.data, q, showRemoved]);
  const removable = visible.filter((r) => !r.removed);
  const allSelected = removable.length > 0 && removable.every((r) => selected.has(r.email));

  const refresh = () => { roster.reload(); events.reload(); };

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
      refresh();
    } catch (ex) {
      setErr(ex.message);
    } finally {
      setBusy(false);
    }
  };

  const toggle = (email) => setSelected((s) => {
    const next = new Set(s);
    if (next.has(email)) next.delete(email);
    else next.add(email);
    return next;
  });

  const toggleAll = () => setSelected(allSelected ? new Set() : new Set(removable.map((r) => r.email)));

  const restore = async (student) => {
    try {
      await api(`/admin/events/${eventId}/roster`, {
        method: 'POST',
        role: 'admin',
        body: { email: student.email, name: student.name },
      });
      toast('Access restored.');
      refresh();
    } catch (ex) {
      toast(ex.message, 'error');
    }
  };

  const download = async () => {
    setDownloadBusy(true);
    try {
      const res = await api(`/admin/events/${eventId}/roster.csv`, { role: 'admin', raw: true });
      const blob = await res.blob();
      const href = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = href;
      a.download = `${ev?.name || 'roster'}.csv`;
      a.click();
      URL.revokeObjectURL(href);
    } catch (ex) {
      toast(ex.message, 'error');
    } finally {
      setDownloadBusy(false);
    }
  };

  const selectedRows = (roster.data?.roster || []).filter((r) => selected.has(r.email));

  return (
    <>
      <PageHeader title="Roster" description="Only emails on the roster can sign in for this event."
        actions={events.data && <div className="flex items-center gap-2"><EventSelect events={events.data.events} value={eventId} onChange={setEventId} /><Button variant="secondary" onClick={download} loading={downloadBusy}><Download size={14} />CSV</Button></div>} />
      {events.error && <Banner tone="error" className="mb-4" action={<Button size="sm" variant="secondary" onClick={events.reload}>Retry</Button>}>{events.error.message}</Banner>}

      {ev && (
        <>
          <Card className="mb-4 p-5">
            <h2 className="text-sm font-medium">Add one student</h2>
            <div className="mt-3"><AddStudent eventId={eventId} onSaved={refresh} /></div>
            <div className="border-t border-line pt-4">
              <div className="mb-2 flex items-center justify-between gap-3">
                <label htmlFor="paste" className="text-[13px] font-medium">Add or update via paste</label>
                <div className="flex items-center gap-2"><RosterBadge ev={ev} /><span className="tnum text-xs text-muted">{ev.roster_updated_at ? `Last updated ${fmtDateTime(ev.roster_updated_at)}` : ''}</span></div>
              </div>
              <Textarea id="paste" rows={4} value={text} onChange={(e) => setText(e.target.value)} placeholder={'john.doe@example.com, John Doe\nsarah.lee@example.com, Sarah Lee'} className="tnum font-mono text-[13px]" aria-describedby="paste-hint" />
              <p id="paste-hint" className="mt-1 text-xs text-muted">One student per line as <code>email,name</code>. Existing emails are updated and restored; new ones are added.</p>
              {err && <Banner tone="error" className="mt-3">{err}</Banner>}
              {summary && (
                <Banner tone={summary.invalid?.length ? 'warn' : 'ok'} className="mt-3" title={`Roster updated: ${summary.added} added, ${summary.updated} updated`}>
                  {summary.invalid?.length > 0 && <><p>{summary.invalid.length} {summary.invalid.length === 1 ? 'line was' : 'lines were'} skipped as invalid and are still in the box above:</p>
                    <ul className="mt-1 list-disc pl-5 text-xs">{summary.invalid.slice(0, 8).map((x) => <li key={x.line}>Line {x.line}: <code>{x.value}</code></li>)}</ul></>}
                </Banner>
              )}
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Button type="button" loading={busy} onClick={submit}>{busy ? 'Importing...' : 'Import roster'}</Button>
                <input ref={fileRef} type="file" accept=".csv,.txt,text/csv,text/plain" className="sr-only" id="csv" onChange={onFile} />
                <Button type="button" variant="secondary" onClick={() => fileRef.current?.click()}><Upload size={14} />Load CSV into box</Button>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line p-3">
              <div className="flex items-center gap-3 px-1">
                <p className="text-sm font-medium">Roster <span className="tnum text-muted">({visible.length})</span></p>
                <label className="flex items-center gap-1.5 text-xs text-muted">
                  <input type="checkbox" checked={showRemoved} onChange={(e) => setShowRemoved(e.target.checked)} className="h-3.5 w-3.5 rounded border-line" />
                  Show removed
                </label>
                {selected.size > 0 && (
                  <Button size="sm" variant="danger" onClick={() => setRemoving({ list: selectedRows })}><Trash2 size={13} />Remove {selected.size}</Button>
                )}
              </div>
              <div className="relative"><Search size={14} className="pointer-events-none absolute left-3 top-3 text-slate-400" aria-hidden /><Input aria-label="Search roster" placeholder="Search name or email" value={q} onChange={(e) => setQ(e.target.value)} className="h-9 w-56 pl-8 text-sm" /></div>
            </div>
            {roster.loading && !roster.data && <TableSkeleton cols={6} />}
            {roster.error && <div className="p-4"><Banner tone="error" action={<Button size="sm" variant="secondary" onClick={roster.reload}>Retry</Button>}>{roster.error.message}</Banner></div>}
            {roster.data && roster.data.roster.length === 0 && <EmptyState icon={<Users size={20} />} title="This roster is empty">Add one student above or paste a list.</EmptyState>}
            {roster.data && roster.data.roster.length > 0 && visible.length === 0 && <EmptyState title="No matches">No student matches the current filter.</EmptyState>}
            {visible.length > 0 && (
              <TableWrap>
                <thead><tr>
                  <Th><input type="checkbox" aria-label="Select all students" checked={allSelected} onChange={toggleAll} className="h-3.5 w-3.5 rounded border-line" /></Th>
                  <Th>Email</Th><Th>Name</Th><Th>Status</Th><Th>Updated</Th><Th><span className="sr-only">Actions</span></Th>
                </tr></thead>
                <tbody>{visible.map((r) => (
                  <tr key={r.email} className={r.removed ? 'bg-canvas/60 text-muted' : ''}>
                    <Td><input type="checkbox" aria-label={`Select ${r.email}`} disabled={r.removed} checked={selected.has(r.email)} onChange={() => toggle(r.email)} className="h-3.5 w-3.5 rounded border-line" /></Td>
                    <Td className="font-medium">{r.email}{r.has_paper && <span className="ml-2 text-[11px] font-normal text-muted">has paper</span>}</Td>
                    <Td>{r.name}</Td>
                    <Td>{r.removed ? <Badge tone="neutral">Removed</Badge> : <Badge tone="ok">Active</Badge>}</Td>
                    <Td className="tnum text-muted">{fmtDateTime(r.updated_at)}</Td>
                    <Td>
                      <div className="flex justify-end gap-1">
                        {r.removed ? (
                          <Button size="sm" variant="secondary" onClick={() => restore(r)}>Restore</Button>
                        ) : (
                          <>
                            <Button variant="ghost" size="sm" aria-label={`Edit ${r.email}`} onClick={() => setEditing(r)}><Pencil size={14} /></Button>
                            <Button variant="ghost" size="sm" aria-label={`Remove ${r.email}`} onClick={() => setRemoving({ list: [r] })}><Trash2 size={14} className="text-danger" /></Button>
                          </>
                        )}
                      </div>
                    </Td>
                  </tr>
                ))}</tbody>
              </TableWrap>
            )}
          </Card>
        </>
      )}
      {events.data && events.data.events.length === 0 && <Card><EmptyState title="No events yet">Create an event first, then import its roster.</EmptyState></Card>}

      <EditStudent student={editing} eventId={eventId} onClose={() => setEditing(null)} onSaved={refresh} />
      <RemoveStudents target={removing} eventId={eventId} onClose={() => setRemoving(null)} onSaved={() => { setSelected(new Set()); refresh(); }} />
    </>
  );
}
