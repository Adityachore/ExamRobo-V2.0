import { Link } from 'react-router';
import { ArrowUpRight, Gauge } from 'lucide-react';
import { Button, Card } from '../../components/ui.jsx';

export default function PlanLimit({ limit = 'this plan limit', used, max }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-4">
      <Card className="w-full max-w-md p-8 text-center">
        <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-warn-soft text-warn-ink">
          <Gauge size={22} aria-hidden />
        </div>
        <h1 className="text-xl font-semibold">Plan limit reached</h1>
        <p className="mt-2 text-sm text-muted">
          You have reached {limit}{used != null && max != null ? ` (${used}/${max})` : ''}. Upgrade to continue.
        </p>
        <p className="mt-3 rounded-lg bg-canvas px-3 py-2 text-xs text-muted">No data has been deleted. Running examinations are not interrupted.</p>
        <Link to="/app/billing" className="mt-6 inline-block">
          <Button><ArrowUpRight size={14} aria-hidden /> View plans</Button>
        </Link>
      </Card>
    </div>
  );
}
