import { useState } from 'react';
import { Link } from 'react-router';
import { Download, Plus, Search, Upload, Users } from 'lucide-react';
import { useApi } from '../../hooks/useApi.js';
import { ENDPOINTS } from '../../lib/endpoints.js';
import { fmtDateTime } from '../../lib/format.js';
import { ApiErrorState } from '../../components/ContractPending.jsx';
import { Badge, Button, Card, EmptyState, Input, PageHeader, TableSkeleton, TableWrap, Td, Th } from '../../components/ui.jsx';

export default function Students() {
  const [q, setQ] = useState('');
  const data = useApi(ENDPOINTS.institution.students({ q }));
  const rows = data.data?.students || data.data || [];

  return (
    <>
      <PageHeader title="Students" description="Institution-wide student directory and import."
        actions={<Button><Plus size={16} />Add student</Button>} />
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative">
          <Search size={14} className="pointer-events-none absolute left-3 top-2.5 text-slate-400" />
          <Input placeholder="Search name or email" value={q} onChange={(e) => setQ(e.target.value)} className="h-9 w-64 pl-8 text-sm" />
        </div>
        <Button variant="secondary" size="sm"><Upload size={14} />Import CSV</Button>
        <Button variant="secondary" size="sm"><Download size={14} />Export</Button>
      </div>
      <Card>
        {data.loading && !data.data && <TableSkeleton />}
        {data.error && <div className="p-4"><ApiErrorState error={data.error} onRetry={data.reload} /></div>}
        {data.data && rows.length === 0 && <EmptyState icon={<Users size={20} />} title="No students yet">Students will appear here once the directory API is connected.</EmptyState>}
        {rows.length > 0 && (
          <TableWrap>
            <thead><tr><Th>Email</Th><Th>Name</Th><Th>Status</Th><Th>Events</Th><Th>Updated</Th><Th></Th></tr></thead>
            <tbody>
              {rows.map((s) => (
                <tr key={s.id}>
                  <Td className="font-medium">{s.email}</Td>
                  <Td>{s.name || '—'}</Td>
                  <Td><Badge tone={s.status === 'active' ? 'ok' : 'neutral'}>{s.status || '—'}</Badge></Td>
                  <Td className="tnum">{s.event_count ?? '—'}</Td>
                  <Td className="tnum text-muted">{fmtDateTime(s.updated_at)}</Td>
                  <Td><Link to={`/app/students/${s.id}`} className="text-sm font-medium text-primary hover:underline">View</Link></Td>
                </tr>
              ))}
            </tbody>
          </TableWrap>
        )}
      </Card>
    </>
  );
}
