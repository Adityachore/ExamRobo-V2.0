import { Link } from 'react-router';
import { ArrowDownRight, ArrowUpRight, Building2, Radio, TrendingUp, Users } from 'lucide-react';
import { useApi } from '../../hooks/useApi.js';
import { ENDPOINTS } from '../../lib/endpoints.js';
import { fmtDateTime } from '../../lib/format.js';
import { ApiErrorState } from '../../components/ContractPending.jsx';
import { Badge, Banner, Button, Card, EmptyState, PageHeader, Spinner, TableWrap, Td, Th } from '../../components/ui.jsx';

function Metric({ label, value, delta, deltaTone = 'ok', icon: Icon }) {
  const isUp = deltaTone === 'ok';
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[13px] font-medium text-muted">{label}</p>
          <p className="mt-1 text-2xl font-semibold tracking-tight tnum">{value ?? '—'}</p>
          {delta != null && (
            <p className={`mt-1.5 flex items-center gap-1 text-xs font-medium ${isUp ? 'text-emerald-600' : 'text-rose-600'}`}>
              {isUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}{delta}
            </p>
          )}
        </div>
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary-soft/60 text-primary"><Icon size={18} /></div>
      </div>
    </Card>
  );
}

export default function PlatformDashboard() {
  const data = useApi(ENDPOINTS.platform.dashboard, 'platform');
  const pending = useApi(ENDPOINTS.platform.applications({ status: 'pending', limit: 5 }), 'platform');
  const s = data.data || {};
  const rows = pending.data?.applications || pending.data?.registrations || [];

  return (
    <>
      <PageHeader title="Platform" description="Aggregate view across all institutions. No student-level data." />
      {data.error && <div className="mb-4"><ApiErrorState error={data.error} onRetry={data.reload} /></div>}
      {(s.alerts || []).length > 0 && (
        <div className="mb-4 space-y-2">
          {s.alerts.map((a) => <Banner key={a.id} tone={a.severity || 'warn'} title={a.title}>{a.message}</Banner>)}
        </div>
      )}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Institutions" value={s.institutions?.total} delta={s.institutions?.delta} icon={Building2} />
        <Metric label="Active this month" value={s.institutions?.active} icon={TrendingUp} />
        <Metric label="Students (all tenants)" value={s.students} delta={s.students_delta} icon={Users} />
        <Metric label="Live sessions now" value={s.live ?? 0} icon={Radio} />
      </div>
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Card className="p-5"><p className="text-[13px] font-medium text-muted">MRR</p><p className="mt-1 text-2xl font-semibold tnum">{s.mrr != null ? `₹${Number(s.mrr).toLocaleString('en-IN')}` : '—'}</p><p className="mt-1 text-xs text-muted">Standard + Premium only</p></Card>
        <Card className="p-5"><p className="text-[13px] font-medium text-muted">Expiring in 7 days</p><p className="mt-1 text-2xl font-semibold tnum text-amber-600">{s.expiring ?? 0}</p></Card>
        <Card className="p-5"><p className="text-[13px] font-medium text-muted">Pending registrations</p><p className="mt-1 text-2xl font-semibold tnum">{s.pending_regs ?? 0}</p></Card>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold">Pending registrations</h2>
            <Link to="/platform/registrations"><Button size="sm" variant="secondary">View all</Button></Link>
          </div>
          {pending.loading && !pending.data ? <div className="flex h-40 items-center justify-center"><Spinner /></div> : pending.error ? <ApiErrorState error={pending.error} onRetry={pending.reload} /> : rows.length === 0 ? (
            <EmptyState title="Queue is clear" icon={<Building2 size={20} />}>No applications waiting for review.</EmptyState>
          ) : (
            <TableWrap>
              <thead><tr><Th>Institution</Th><Th>Owner</Th><Th>Submitted</Th><Th>Type</Th><Th></Th></tr></thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id}>
                    <Td className="font-medium">{r.institution_name}</Td>
                    <Td className="text-muted">{r.owner_email}</Td>
                    <Td className="tnum text-muted">{fmtDateTime(r.submitted_at)}</Td>
                    <Td><Badge tone="blue">{r.type}</Badge></Td>
                    <Td><Link to={`/platform/registrations/${r.id}`} className="text-sm font-medium text-primary hover:underline">Review</Link></Td>
                  </tr>
                ))}
              </tbody>
            </TableWrap>
          )}
        </Card>
        <Card className="p-5">
          <h2 className="mb-3 text-sm font-semibold">Plan mix</h2>
          <ul className="space-y-3">
            {[['Trial', s.plans?.trial ?? 0, 'blue'], ['Standard', s.plans?.standard ?? 0, 'ok'], ['Premium', s.plans?.premium ?? 0, 'ok'], ['Elite', s.plans?.elite ?? 0, 'neutral'], ['Suspended', s.plans?.suspended ?? 0, 'danger']].map(([label, count, tone]) => (
              <li key={label} className="flex items-center justify-between"><span className="text-sm text-muted">{label}</span><Badge tone={tone}>{count}</Badge></li>
            ))}
          </ul>
        </Card>
      </div>
    </>
  );
}
