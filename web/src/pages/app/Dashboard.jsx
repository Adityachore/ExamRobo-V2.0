import { Link } from 'react-router';
import { CalendarDays, GraduationCap, Radio, Users } from 'lucide-react';
import { useApi } from '../../hooks/useApi.js';
import { ENDPOINTS } from '../../lib/endpoints.js';
import { ApiErrorState } from '../../components/ContractPending.jsx';
import { Banner, Button, Card, PageHeader, Skeleton } from '../../components/ui.jsx';

function Metric({ label, value, icon: Icon }) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[13px] font-medium text-muted">{label}</p>
          <p className="mt-1 text-2xl font-semibold tracking-tight tnum">{value ?? '—'}</p>
        </div>
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary-soft/60 text-primary"><Icon size={18} aria-hidden /></div>
      </div>
    </Card>
  );
}

export default function Dashboard() {
  const usage = useApi(ENDPOINTS.institution.usage);
  const events = useApi(ENDPOINTS.institution.events);
  const u = usage.data || {};
  const list = events.data?.events || events.data || [];

  return (
    <>
      <PageHeader
        title="Institution dashboard"
        description="Exam activity, plan usage and alerts for this institution."
        actions={<Link to="/app/events"><Button>Create event</Button></Link>}
      />
      {usage.error && <div className="mb-4"><ApiErrorState error={usage.error} onRetry={usage.reload} /></div>}
      {u.status === 'expired' && <Banner tone="warn" className="mb-4">Plan expired. Results remain readable; new events are blocked.</Banner>}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Students" value={u.students ?? u.counts?.students} icon={GraduationCap} />
        <Metric label="Events this period" value={u.events ?? u.counts?.events} icon={CalendarDays} />
        <Metric label="Active staff" value={u.employees ?? u.counts?.employees} icon={Users} />
        <Metric label="Live now" value={u.live ?? u.counts?.live} icon={Radio} />
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold">Recent events</h2>
            <Link to="/app/events" className="text-sm font-medium text-primary hover:underline">View all</Link>
          </div>
          {events.loading && !events.data ? (
            <div className="space-y-3">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-10" />)}</div>
          ) : events.error ? (
            <ApiErrorState error={events.error} onRetry={events.reload} />
          ) : list.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted">No events yet. Create the first event when the v2 API is connected.</p>
          ) : (
            <ul className="divide-y divide-line">
              {list.slice(0, 5).map((e) => (
                <li key={e.id} className="flex items-center justify-between gap-3 py-3">
                  <div><p className="text-sm font-medium">{e.name}</p><p className="text-xs text-muted">{e.starts_at || 'Schedule pending'}</p></div>
                  <Link to={`/app/events/${e.id}`} className="text-sm font-medium text-primary hover:underline">Open</Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
        <Card className="p-5">
          <h2 className="text-sm font-semibold">Plan usage</h2>
          <ul className="mt-3 space-y-3 text-sm">
            <li className="flex justify-between"><span className="text-muted">Plan</span><span className="font-medium">{u.plan || '—'}</span></li>
            <li className="flex justify-between"><span className="text-muted">Events</span><span className="tnum">{u.events_used ?? '—'} / {u.events_limit ?? '—'}</span></li>
            <li className="flex justify-between"><span className="text-muted">Employees</span><span className="tnum">{u.seats_used ?? '—'} / {u.seats_limit ?? '—'}</span></li>
            <li className="flex justify-between"><span className="text-muted">Roster / event</span><span className="tnum">{u.roster_limit ?? '—'}</span></li>
          </ul>
          <Link to="/app/billing" className="mt-4 inline-block text-sm font-medium text-primary hover:underline">Manage plan</Link>
        </Card>
      </div>
    </>
  );
}
