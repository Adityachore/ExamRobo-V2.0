import { useMemo, useState } from 'react';
import { Ticket } from 'lucide-react';
import { api } from '../../lib/api.js';
import { useFetch } from '../../hooks/useFetch.js';
import { fmtDateTime } from '../../lib/format.js';
import { Badge, Banner, Button, Card, ConfirmDialog, EmptyState, PageHeader, TableSkeleton, TableWrap, Tabs, Td, Th, useToast } from '../../components/ui.jsx';

export default function Tickets() {
  const { data, error, loading, reload } = useFetch('/admin/tickets');
  const toast = useToast();
  const [filter, setFilter] = useState('open');
  const [target, setTarget] = useState(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const rows = useMemo(() => (data?.tickets || []).filter((t) => filter === 'all' || t.status === filter), [data, filter]);

  const apply = async () => {
    const next = target.status === 'open' ? 'resolved' : 'open';
    setBusy(true); setErr('');
    try { await api(`/admin/tickets/${target.id}`, { method: 'PATCH', role: 'admin', body: { status: next } }); toast(next === 'resolved' ? 'Ticket resolved.' : 'Ticket reopened.'); setTarget(null); reload(); }
    catch (e) { setErr(e.message); } finally { setBusy(false); }
  };

  return (
    <>
      <PageHeader title="Tickets" description="Support requests from the sign-in page, including automatic lockout tickets." />
      <div className="mb-3"><Tabs label="Filter tickets" value={filter} onChange={setFilter} items={[['open', 'Unresolved'], ['resolved', 'Resolved'], ['all', 'All']]} /></div>
      <Card>
        {loading && !data && <TableSkeleton />}
        {error && <div className="p-4"><Banner tone="error" action={<Button size="sm" variant="secondary" onClick={reload}>Retry</Button>}>{error.message}</Banner></div>}
        {data && rows.length === 0 && <EmptyState icon={<Ticket size={20} />} title={filter === 'open' ? 'No unresolved tickets' : 'No tickets to show'}>{filter === 'open' ? 'You are all caught up.' : 'Try another filter.'}</EmptyState>}
        {rows.length > 0 && (
          <TableWrap>
            <thead><tr><Th>Student email</Th><Th>Reason</Th><Th>Source</Th><Th>Created</Th><Th>Status</Th><Th><span className="sr-only">Action</span></Th></tr></thead>
            <tbody>
              {rows.map((t) => (
                <tr key={t.id}>
                  <Td className="font-medium">{t.email}</Td>
                  <Td className="max-w-xs">{t.reason}</Td>
                  <Td>{t.source === 'lockout' ? <Badge tone="warn">Lockout</Badge> : <Badge tone="blue">Contact</Badge>}</Td>
                  <Td className="tnum whitespace-nowrap text-muted">{fmtDateTime(t.created_at)}</Td>
                  <Td>{t.status === 'resolved' ? <Badge tone="ok">Resolved</Badge> : <Badge tone="warn">Open</Badge>}</Td>
                  <Td><div className="flex justify-end"><Button size="sm" variant="secondary" onClick={() => { setErr(''); setTarget(t); }}>{t.status === 'open' ? 'Resolve' : 'Reopen'}</Button></div></Td>
                </tr>
              ))}
            </tbody>
          </TableWrap>
        )}
      </Card>
      <ConfirmDialog open={!!target} onClose={() => setTarget(null)} onConfirm={apply} loading={busy} error={err} title={target?.status === 'open' ? 'Resolve this ticket?' : 'Reopen this ticket?'} confirmLabel={target?.status === 'open' ? 'Resolve' : 'Reopen'}
        description={target ? `${target.email}: ${target.reason}` : ''} />
    </>
  );
}
