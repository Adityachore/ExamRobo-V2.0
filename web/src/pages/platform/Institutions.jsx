import { useState } from 'react';
import { Link } from 'react-router';
import { Search } from 'lucide-react';
import { useApi } from '../../hooks/useApi.js';
import { ENDPOINTS } from '../../lib/endpoints.js';
import { ApiErrorState } from '../../components/ContractPending.jsx';
import { Badge, Card, Input, PageHeader, TableSkeleton, TableWrap, Td, Th } from '../../components/ui.jsx';

export default function Institutions() {
  const [q, setQ] = useState('');
  const data = useApi(ENDPOINTS.platform.institutions({ q }), 'platform');
  const rows = data.data?.institutions || [];

  return (
    <>
      <PageHeader title="Institutions" description="All tenants. Aggregate data only." />
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative">
          <Search size={14} className="pointer-events-none absolute left-3 top-2.5 text-slate-400" />
          <Input placeholder="Search institutions" value={q} onChange={(e) => setQ(e.target.value)} className="h-9 w-64 pl-8 text-sm" />
        </div>
        <p className="text-xs text-muted">Tenant detail requires a scoped support grant.</p>
      </div>
      <Card>
        {data.loading && !data.data && <TableSkeleton />}
        {data.error && <div className="p-4"><ApiErrorState error={data.error} onRetry={data.reload} /></div>}
        {data.data && rows.length === 0 && <div className="p-8 text-center text-sm text-muted">No institutions match this search.</div>}
        {rows.length > 0 && (
          <TableWrap>
            <thead><tr><Th>Name</Th><Th>Plan</Th><Th>Status</Th><Th>Students</Th><Th>Events</Th><Th></Th></tr></thead>
            <tbody>
              {rows.map((i) => (
                <tr key={i.id}>
                  <Td className="font-medium">{i.name}</Td>
                  <Td><Badge>{i.plan || '—'}</Badge></Td>
                  <Td><Badge tone={i.status === 'active' ? 'ok' : i.status === 'suspended' ? 'danger' : 'neutral'}>{i.status || '—'}</Badge></Td>
                  <Td className="tnum">{i.students ?? '—'}</Td>
                  <Td className="tnum">{i.events ?? '—'}</Td>
                  <Td><Link to={`/platform/institutions/${i.id}`} className="text-sm font-medium text-primary hover:underline">Open</Link></Td>
                </tr>
              ))}
            </tbody>
          </TableWrap>
        )}
      </Card>
    </>
  );
}
