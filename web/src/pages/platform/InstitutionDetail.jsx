import { Link, useParams } from 'react-router';
import { ArrowLeft } from 'lucide-react';
import { useApi } from '../../hooks/useApi.js';
import { ENDPOINTS } from '../../lib/endpoints.js';
import { ApiErrorState } from '../../components/ContractPending.jsx';
import { Badge, Button, Card, PageHeader, Spinner } from '../../components/ui.jsx';

export default function InstitutionDetail() {
  const { id } = useParams();
  const data = useApi(id ? ENDPOINTS.platform.institution(id) : null, 'platform');
  if (data.loading) return <div className="flex h-64 items-center justify-center"><Spinner /></div>;
  if (data.error) return <ApiErrorState error={data.error} onRetry={data.reload} />;
  const i = data.data || {};

  return (
    <>
      <PageHeader title={i.name || 'Institution'} description="Minimum operational summary. No raw student answers." />
      <Link to="/platform/institutions" className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"><ArrowLeft size={14} /> All institutions</Link>
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <h2 className="text-sm font-semibold">Overview</h2>
          <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
            <div><dt className="text-muted">Plan</dt><dd className="font-medium">{i.plan || '—'}</dd></div>
            <div><dt className="text-muted">Status</dt><dd><Badge tone={i.status === 'active' ? 'ok' : i.status === 'suspended' ? 'danger' : 'neutral'}>{i.status || '—'}</Badge></dd></div>
            <div><dt className="text-muted">Students</dt><dd className="font-medium tnum">{i.students ?? '—'}</dd></div>
            <div><dt className="text-muted">Active events</dt><dd className="font-medium tnum">{i.events ?? '—'}</dd></div>
            <div><dt className="text-muted">Trial / period end</dt><dd className="font-medium">{i.ends_at || i.period_end || '—'}</dd></div>
            <div><dt className="text-muted">Owner</dt><dd className="font-medium">{i.owner_email || '—'}</dd></div>
          </dl>
        </Card>
        <Card className="p-5">
          <h2 className="text-sm font-semibold">Actions</h2>
          <p className="mt-1 text-xs text-muted">Administrative actions require a reason and are audited.</p>
          <div className="mt-4 flex flex-col gap-2">
            <Button variant="secondary">Suspend</Button>
            <Button variant="secondary">Reinstate</Button>
            <Button variant="danger">Archive</Button>
          </div>
        </Card>
      </div>
    </>
  );
}
