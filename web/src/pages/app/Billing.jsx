import { CreditCard, Download } from 'lucide-react';
import { useApi } from '../../hooks/useApi.js';
import { ENDPOINTS } from '../../lib/endpoints.js';
import { ApiErrorState } from '../../components/ContractPending.jsx';
import { Banner, Button, Card, PageHeader, TableWrap, Td, Th } from '../../components/ui.jsx';

export default function Billing() {
  const data = useApi(ENDPOINTS.institution.billing);
  const p = data.data || {};
  const invoices = p.invoices || [];

  return (
    <>
      <PageHeader title="Billing & plan" description="Current plan, usage, payments and invoices." />
      {data.error ? <ApiErrorState error={data.error} onRetry={data.reload} /> : (
        <>
          {p.status === 'expired' && <Banner tone="warn" className="mb-4">Plan expired. Results remain readable; new events are blocked.</Banner>}
          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="p-5 lg:col-span-2">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-sm font-semibold">Current plan</h2>
                  <p className="mt-2 text-2xl font-semibold">{p.plan_name || p.plan || '—'}</p>
                  <p className="text-sm text-muted">{p.amount != null ? `₹${Number(p.amount).toLocaleString('en-IN')} / 30 days` : 'Plan pricing pending'}</p>
                  <p className="mt-1 text-xs text-muted">GST placeholder only. Live invoicing requires CA approval.</p>
                </div>
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary-soft text-primary"><CreditCard size={18} /></div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button>Upgrade</Button>
                <Button variant="secondary">Renew</Button>
                <Button variant="secondary"><Download size={14} />Invoices</Button>
              </div>
            </Card>
            <Card className="p-5">
              <h2 className="text-sm font-semibold">Usage this period</h2>
              <ul className="mt-3 space-y-2 text-sm">
                <li className="flex justify-between"><span className="text-muted">Events</span><span className="tnum">{p.used_events ?? '—'}/{p.limit_events ?? '—'}</span></li>
                <li className="flex justify-between"><span className="text-muted">Employees</span><span className="tnum">{p.used_seats ?? '—'}/{p.limit_seats ?? '—'}</span></li>
                <li className="flex justify-between"><span className="text-muted">Roster / event</span><span className="tnum">{p.roster_limit ?? '—'}</span></li>
              </ul>
            </Card>
          </div>
          <Card className="mt-4">
            <div className="border-b border-line px-5 py-4"><h2 className="text-sm font-semibold">Invoices</h2></div>
            {invoices.length === 0 ? <p className="p-8 text-center text-sm text-muted">No invoices yet.</p> : (
              <TableWrap>
                <thead><tr><Th>Invoice</Th><Th>Date</Th><Th>Amount</Th><Th>Status</Th><Th></Th></tr></thead>
                <tbody>
                  {invoices.map((i) => (
                    <tr key={i.id}>
                      <Td className="font-medium">{i.number || i.id}</Td>
                      <Td>{i.issued_at || '—'}</Td>
                      <Td className="tnum">{i.amount != null ? `₹${Number(i.amount).toLocaleString('en-IN')}` : '—'}</Td>
                      <Td>{i.status || '—'}</Td>
                      <Td><Button size="sm" variant="ghost">View</Button></Td>
                    </tr>
                  ))}
                </tbody>
              </TableWrap>
            )}
          </Card>
        </>
      )}
    </>
  );
}
