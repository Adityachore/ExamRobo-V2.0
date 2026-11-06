import { useState } from 'react';
import { Link, useParams } from 'react-router';
import { useApi } from '../../hooks/useApi.js';
import { ENDPOINTS } from '../../lib/endpoints.js';
import { ApiErrorState } from '../../components/ContractPending.jsx';
import { Card, PageHeader, Spinner, Tabs } from '../../components/ui.jsx';

const TABS = [
  ['overview', 'Overview'],
  ['roster', 'Roster'],
  ['papers', 'Papers'],
  ['schedule', 'Schedule'],
  ['live', 'Live'],
  ['results', 'Results'],
  ['settings', 'Settings'],
];

export default function EventWorkspace() {
  const { id } = useParams();
  const ev = useApi(id ? ENDPOINTS.institution.event(id) : null);
  const [tab, setTab] = useState('overview');
  const e = ev.data || {};

  if (ev.loading) return <div className="flex h-64 items-center justify-center"><Spinner /></div>;
  if (ev.error) return <ApiErrorState error={ev.error} onRetry={ev.reload} />;

  return (
    <>
      <PageHeader title={e.name || 'Event'} description={e.starts_at ? `Starts ${e.starts_at}` : 'Event workspace'} />
      <Tabs items={TABS} value={tab} onChange={setTab} />
      <div className="mt-4">
        {tab === 'overview' && (
          <Card className="p-5">
            <dl className="grid gap-4 text-sm sm:grid-cols-3">
              <div><dt className="text-muted">Duration</dt><dd className="font-medium">{e.duration_min ?? '—'} min</dd></div>
              <div><dt className="text-muted">Questions</dt><dd className="font-medium">{e.max_questions ?? '—'}</dd></div>
              <div><dt className="text-muted">Roster</dt><dd className="font-medium">{e.roster_count ?? '—'} students</dd></div>
            </dl>
            <p className="mt-4 text-xs text-muted">Roster, paper, schedule and live panels will populate when their v2 endpoints are connected.</p>
          </Card>
        )}
        {tab !== 'overview' && (
          <Card className="p-8 text-center text-sm text-muted">
            This tab is built as part of the event workspace. Its API contract is not connected yet.
            <div className="mt-4"><Link to="/app/events" className="font-medium text-primary hover:underline">Back to events</Link></div>
          </Card>
        )}
      </div>
    </>
  );
}
