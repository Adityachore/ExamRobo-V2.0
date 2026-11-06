import { useApi } from '../../hooks/useApi.js';
import { ENDPOINTS } from '../../lib/endpoints.js';
import { fmtDateTime } from '../../lib/format.js';
import { ApiErrorState } from '../../components/ContractPending.jsx';
import { Badge, Card, PageHeader, TableSkeleton, TableWrap, Td, Th } from '../../components/ui.jsx';

export default function Activity() {
  const data = useApi(ENDPOINTS.institution.audit);
  const rows = data.data?.events || data.data?.entries || data.data || [];

  return (
    <>
      <PageHeader title="Activity & audit" description="Institution-visible audit entries. Platform-only metadata is never shown." />
      <Card>
        {data.loading && !data.data && <TableSkeleton />}
        {data.error && <div className="p-4"><ApiErrorState error={data.error} onRetry={data.reload} /></div>}
        {data.data && rows.length === 0 && <p className="p-8 text-center text-sm text-muted">No activity recorded yet.</p>}
        {rows.length > 0 && (
          <TableWrap>
            <thead><tr><Th>Time</Th><Th>Actor</Th><Th>Action</Th><Th>Target</Th><Th>Result</Th></tr></thead>
            <tbody>
              {rows.map((e) => (
                <tr key={e.id}>
                  <Td className="tnum text-muted">{fmtDateTime(e.created_at || e.time)}</Td>
                  <Td className="font-medium">{e.actor || e.actor_email || '—'}</Td>
                  <Td>{e.action || '—'}</Td>
                  <Td className="text-muted">{e.target || '—'}</Td>
                  <Td><Badge tone={e.result === 'denied' ? 'danger' : 'ok'}>{e.result || 'ok'}</Badge></Td>
                </tr>
              ))}
            </tbody>
          </TableWrap>
        )}
      </Card>
    </>
  );
}
