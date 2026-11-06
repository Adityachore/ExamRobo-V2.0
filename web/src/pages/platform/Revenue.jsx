import { useApi } from '../../hooks/useApi.js';
import { ENDPOINTS } from '../../lib/endpoints.js';
import { ApiErrorState } from '../../components/ContractPending.jsx';
import { Badge, Card, PageHeader, TableSkeleton, TableWrap, Td, Th } from '../../components/ui.jsx';

export default function Revenue() {
  const data = useApi(ENDPOINTS.platform.reconciliation, 'platform');
  const mismatches = data.data?.mismatches || [];
  const totals = data.data?.totals || {};

  return (
    <>
      <PageHeader title="Revenue & invoices" description="Payments, invoices and provider reconciliation. Aggregate finance view." />
      {data.error ? (
        <ApiErrorState error={data.error} onRetry={data.reload} />
      ) : (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <Card className="p-5"><p className="text-xs font-medium text-muted">Collected this month</p><p className="mt-1 text-2xl font-semibold tnum">{totals.collected != null ? `₹${Number(totals.collected).toLocaleString('en-IN')}` : '—'}</p></Card>
            <Card className="p-5"><p className="text-xs font-medium text-muted">Pending reconciliation</p><p className="mt-1 text-2xl font-semibold tnum text-amber-600">{totals.pending ?? '—'}</p></Card>
            <Card className="p-5"><p className="text-xs font-medium text-muted">Refunds / adjustments</p><p className="mt-1 text-2xl font-semibold tnum">{totals.refunds != null ? `₹${Number(totals.refunds).toLocaleString('en-IN')}` : '—'}</p></Card>
          </div>
          <Card>
            <div className="border-b border-line px-5 py-4">
              <h2 className="text-sm font-semibold">Reconciliation queue</h2>
              <p className="mt-1 text-xs text-muted">Invoice list and refund actions remain pending until their contract is connected.</p>
            </div>
            {data.loading && !data.data ? <TableSkeleton /> : mismatches.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted">No mismatches reported.</div>
            ) : (
              <TableWrap>
                <thead><tr><Th>Institution</Th><Th>Provider</Th><Th>Amount</Th><Th>State</Th><Th>Age</Th></tr></thead>
                <tbody>
                  {mismatches.map((m) => (
                    <tr key={m.id}>
                      <Td className="font-medium">{m.institution_name || '—'}</Td>
                      <Td>{m.provider || '—'}</Td>
                      <Td className="tnum">{m.amount != null ? `₹${Number(m.amount).toLocaleString('en-IN')}` : '—'}</Td>
                      <Td><Badge tone="warn">{m.state || 'pending'}</Badge></Td>
                      <Td className="text-muted">{m.age || '—'}</Td>
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
