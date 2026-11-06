import { useState } from 'react';
import { Link } from 'react-router';
import { Search } from 'lucide-react';
import { useApi } from '../../hooks/useApi.js';
import { ENDPOINTS } from '../../lib/endpoints.js';
import { fmtDateTime } from '../../lib/format.js';
import { ApiErrorState } from '../../components/ContractPending.jsx';
import { Badge, Card, EmptyState, Input, PageHeader, TableSkeleton, TableWrap, Td, Th } from '../../components/ui.jsx';

export default function RegistrationsQueue() {
  const [status, setStatus] = useState('pending');
  const [q, setQ] = useState('');
  const data = useApi(ENDPOINTS.platform.applications({ status, q }), 'platform');
  const rows = data.data?.applications || data.data?.registrations || [];

  return (
    <>
      <PageHeader title="Registrations" description="Review and approve institution applications." />
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="flex rounded-lg border border-line bg-white p-0.5">
          {['pending', 'more_info', 'approved', 'rejected'].map((s) => (
            <button key={s} onClick={() => setStatus(s)} className={`rounded-md px-3 py-1.5 text-sm capitalize ${status === s ? 'bg-primary text-white' : 'text-muted hover:text-ink'}`}>
              {s.replace('_', ' ')}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search size={14} className="pointer-events-none absolute left-3 top-2.5 text-slate-400" />
          <Input placeholder="Search name or email" value={q} onChange={(e) => setQ(e.target.value)} className="h-9 w-56 pl-8 text-sm" />
        </div>
      </div>
      <Card>
        {data.loading && !data.data && <TableSkeleton />}
        {data.error && <div className="p-4"><ApiErrorState error={data.error} onRetry={data.reload} /></div>}
        {data.data && rows.length === 0 && <EmptyState title={`No ${status.replace('_', ' ')} applications`} />}
        {rows.length > 0 && (
          <TableWrap>
            <thead><tr><Th>Institution</Th><Th>Owner</Th><Th>Type</Th><Th>Submitted</Th><Th>Signals</Th><Th></Th></tr></thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <Td className="font-medium">{r.institution_name}</Td>
                  <Td className="text-muted">{r.owner_email}</Td>
                  <Td><Badge tone="blue">{r.type || '—'}</Badge></Td>
                  <Td className="tnum text-muted">{fmtDateTime(r.submitted_at)}</Td>
                  <Td>{r.abuse_signal && <Badge tone="danger">Review</Badge>}</Td>
                  <Td><Link to={`/platform/registrations/${r.id}`} className="text-sm font-medium text-primary hover:underline">Open</Link></Td>
                </tr>
              ))}
            </tbody>
          </TableWrap>
        )}
      </Card>
    </>
  );
}
