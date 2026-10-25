import { useMemo, useState } from 'react';
import { Flag, Plus } from 'lucide-react';
import { api } from '../../lib/api.js';
import { useFetch } from '../../hooks/useFetch.js';
import { fmtDateTime } from '../../lib/format.js';
import { Badge, Banner, Button, Card, ConfirmDialog, EmptyState, Field, Input, Modal, PageHeader, Select, TableSkeleton, TableWrap, Tabs, Td, Textarea, Th, useToast } from '../../components/ui.jsx';

const KINDS = { HR_MISTAKE: ['warn', 'HR mistake'], MISCONDUCT: ['danger', 'Misconduct'] };

function CreateFlag({ open, onClose, onCreated }) {
  const toast = useToast();
  const [kind, setKind] = useState('MISCONDUCT');
  const [email, setEmail] = useState('');
  const [reason, setReason] = useState('');
  const [err, setErr] = useState('');
  const [fieldErr, setFieldErr] = useState('');
  const [busy, setBusy] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    if (!reason.trim()) { setFieldErr('A reason is required.'); return; }
    setFieldErr(''); setErr(''); setBusy(true);
    try { await api('/admin/flags', { method: 'POST', role: 'admin', body: { kind, email: email.trim() || null, reason: reason.trim() } }); toast('Flag created.'); setReason(''); setEmail(''); onCreated(); onClose(); }
    catch (ex) { setErr(ex.message); } finally { setBusy(false); }
  };
  return (
    <Modal open={open} onClose={onClose} title="Create flag">
      <form onSubmit={submit} noValidate className="space-y-3">
        {err && <Banner tone="error">{err}</Banner>}
        <Field label="Kind" hint={kind === 'HR_MISTAKE' ? 'Roster or HR correction, e.g. a same-day student fix.' : 'A proctor-driven conduct concern.'}>{(p) => <Select {...p} value={kind} onChange={(e) => setKind(e.target.value)}><option value="MISCONDUCT">MISCONDUCT</option><option value="HR_MISTAKE">HR_MISTAKE</option></Select>}</Field>
        <Field label="Student email (optional)">{(p) => <Input {...p} type="email" value={email} onChange={(e) => setEmail(e.target.value)} />}</Field>
        <Field label="Reason" error={fieldErr}>{(p) => <Textarea {...p} rows={3} value={reason} onChange={(e) => setReason(e.target.value)} />}</Field>
        <div className="flex justify-end gap-2"><Button type="button" variant="secondary" onClick={onClose}>Cancel</Button><Button type="submit" loading={busy}>Create flag</Button></div>
      </form>
    </Modal>
  );
}

export default function Flags() {
  const { data, error, loading, reload } = useFetch('/admin/flags');
  const toast = useToast();
  const [filter, setFilter] = useState('open');
  const [create, setCreate] = useState(false);
  const [target, setTarget] = useState(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const rows = useMemo(() => (data?.flags || []).filter((f) => filter === 'all' || f.status === filter), [data, filter]);

  const apply = async () => {
    const next = target.status === 'open' ? 'resolved' : 'open';
    setBusy(true); setErr('');
    try { await api(`/admin/flags/${target.id}`, { method: 'PATCH', role: 'admin', body: { status: next } }); toast(next === 'resolved' ? 'Flag resolved.' : 'Flag reopened.'); setTarget(null); reload(); }
    catch (e) { setErr(e.message); } finally { setBusy(false); }
  };

  return (
    <>
      <PageHeader title="Flags" description="HR_MISTAKE covers roster/HR corrections. MISCONDUCT is raised by proctors."
        actions={<Button onClick={() => setCreate(true)}><Plus size={16} />Create flag</Button>} />
      <div className="mb-3"><Tabs label="Filter flags" value={filter} onChange={setFilter} items={[['open', 'Unresolved'], ['resolved', 'Resolved'], ['all', 'All']]} /></div>
      <Card>
        {loading && !data && <TableSkeleton />}
        {error && <div className="p-4"><Banner tone="error" action={<Button size="sm" variant="secondary" onClick={reload}>Retry</Button>}>{error.message}</Banner></div>}
        {data && rows.length === 0 && <EmptyState icon={<Flag size={20} />} title={filter === 'open' ? 'No unresolved flags' : 'No flags to show'}>{filter === 'open' ? 'Nothing needs attention right now.' : 'Try another filter.'}</EmptyState>}
        {rows.length > 0 && (
          <TableWrap>
            <thead><tr><Th>Kind</Th><Th>Student</Th><Th>Reason</Th><Th>Created</Th><Th>Status</Th><Th><span className="sr-only">Action</span></Th></tr></thead>
            <tbody>
              {rows.map((f) => (
                <tr key={f.id}>
                  <Td><Badge tone={KINDS[f.kind][0]}>{f.kind}</Badge></Td>
                  <Td>{f.email || <span className="text-muted">—</span>}</Td>
                  <Td className="max-w-xs">{f.reason}</Td>
                  <Td className="tnum whitespace-nowrap text-muted">{fmtDateTime(f.created_at)}</Td>
                  <Td>{f.status === 'resolved' ? <Badge tone="ok">Resolved</Badge> : <Badge tone="warn">Open</Badge>}</Td>
                  <Td><div className="flex justify-end"><Button size="sm" variant="secondary" onClick={() => { setErr(''); setTarget(f); }}>{f.status === 'open' ? 'Resolve' : 'Reopen'}</Button></div></Td>
                </tr>
              ))}
            </tbody>
          </TableWrap>
        )}
      </Card>
      <CreateFlag open={create} onClose={() => setCreate(false)} onCreated={reload} />
      <ConfirmDialog open={!!target} onClose={() => setTarget(null)} onConfirm={apply} loading={busy} error={err} title={target?.status === 'open' ? 'Resolve this flag?' : 'Reopen this flag?'} confirmLabel={target?.status === 'open' ? 'Resolve' : 'Reopen'}
        description={target ? `${target.kind}${target.email ? ` · ${target.email}` : ''}: ${target.reason}` : ''} />
    </>
  );
}
