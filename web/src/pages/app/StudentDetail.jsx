import { useParams } from 'react-router';
import { useApi } from '../../hooks/useApi.js';
import { ENDPOINTS } from '../../lib/endpoints.js';
import { fmtDateTime } from '../../lib/format.js';
import { ApiErrorState } from '../../components/ContractPending.jsx';
import { Badge, Button, Card, PageHeader, TableWrap, Td, Th } from '../../components/ui.jsx';

export default function StudentDetail() {
  const { id } = useParams();
  const data = useApi(id ? ENDPOINTS.institution.student(id) : null);
  const s = data.data || {};
  return (
    <>
      <PageHeader title={s.name || s.email || 'Student'} description={s.email || 'Student detail'}
        actions={<Button variant="danger" size="sm">Disable student</Button>} />
      {data.error ? <ApiErrorState error={data.error} onRetry={data.reload} /> : (
        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="p-5">
            <h2 className="mb-3 text-sm font-semibold">Profile</h2>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between gap-3"><dt className="text-muted">Status</dt><dd><Badge tone={s.status === 'active' ? 'ok' : 'neutral'}>{s.status || '—'}</Badge></dd></div>
              <div className="flex justify-between gap-3"><dt className="text-muted">Created</dt><dd className="tnum">{fmtDateTime(s.created_at)}</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-muted">Last activity</dt><dd className="tnum">{fmtDateTime(s.last_seen_at)}</dd></div>
            </dl>
          </Card>
          <Card className="p-5 lg:col-span-2">
            <h2 className="mb-3 text-sm font-semibold">Event history</h2>
            {(s.attempts || []).length === 0 ? <p className="py-8 text-center text-sm text-muted">No attempts recorded.</p> : (
              <TableWrap>
                <thead><tr><Th>Event</Th><Th>Status</Th><Th>Score</Th><Th>Submitted</Th></tr></thead>
                <tbody>
                  {(s.attempts || []).map((a) => (
                    <tr key={a.id}>
                      <Td className="font-medium">{a.event_name}</Td>
                      <Td><Badge>{a.status}</Badge></Td>
                      <Td className="tnum">{a.score != null ? `${a.score}%` : '—'}</Td>
                      <Td className="tnum text-muted">{fmtDateTime(a.submitted_at)}</Td>
                    </tr>
                  ))}
                </tbody>
              </TableWrap>
            )}
          </Card>
        </div>
      )}
    </>
  );
}
