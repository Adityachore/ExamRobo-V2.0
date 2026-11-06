import { useApi } from '../../hooks/useApi.js';
import { ENDPOINTS } from '../../lib/endpoints.js';
import { ApiErrorState } from '../../components/ContractPending.jsx';
import { Badge, Card, PageHeader } from '../../components/ui.jsx';

const CATALOGUE = [
  { code: 'trial', name: 'Trial', price: 'Free', duration: '7 days', roster: '700', events: '10', seats: '2', admin: '1' },
  { code: 'standard', name: 'Standard', price: '₹10,000', duration: '30 days', roster: '300', events: '30', seats: '5', admin: '1' },
  { code: 'premium', name: 'Premium', price: '₹20,000', duration: '30 days', roster: '700', events: '100', seats: '15', admin: '1' },
  { code: 'elite', name: 'Elite', price: 'Contract', duration: 'Contract', roster: 'Contract', events: 'Contract', seats: 'Contract', admin: '1' },
];

export default function Plans() {
  const data = useApi(ENDPOINTS.platform.plans, 'platform');
  const plans = data.data?.plans || data.data || [];
  const rows = plans.length ? plans : CATALOGUE;

  return (
    <>
      <PageHeader title="Plans" description="Approved v2 catalogue. Existing periods keep their frozen snapshot." />
      {data.error && <div className="mb-4"><ApiErrorState error={data.error} onRetry={data.reload} /></div>}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {rows.map((p) => (
          <Card key={p.code || p.id} className="p-5">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm font-semibold">{p.name}</h2>
              <Badge tone={p.code === 'elite' ? 'neutral' : 'blue'}>{p.code || 'plan'}</Badge>
            </div>
            <p className="mt-3 text-2xl font-semibold">{p.price ?? (p.amount != null ? `₹${Number(p.amount).toLocaleString('en-IN')}` : '—')}</p>
            <p className="text-xs text-muted">{p.duration || p.duration_days ? `${p.duration || p.duration_days} days` : '—'}</p>
            <dl className="mt-4 space-y-2 border-t border-line pt-4 text-sm">
              <div className="flex justify-between"><dt className="text-muted">Roster / event</dt><dd className="tnum">{p.roster ?? p.roster_limit ?? '—'}</dd></div>
              <div className="flex justify-between"><dt className="text-muted">Events / period</dt><dd className="tnum">{p.events ?? p.events_limit ?? '—'}</dd></div>
              <div className="flex justify-between"><dt className="text-muted">Employee seats</dt><dd className="tnum">{p.seats ?? p.employee_limit ?? '—'}</dd></div>
              <div className="flex justify-between"><dt className="text-muted">Admin seats</dt><dd className="tnum">{p.admin ?? '1'}</dd></div>
            </dl>
          </Card>
        ))}
      </div>
      <p className="mt-4 text-xs text-muted">GST is a placeholder. Annual plans, proration and custom domains are out of scope for v2.0. Live invoicing is gated by CA approval.</p>
    </>
  );
}
