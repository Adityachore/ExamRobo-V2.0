import { useSearchParams, Link } from 'react-router';
import { CheckCircle2, Clock, HelpCircle, XCircle } from 'lucide-react';
import { useApi } from '../../hooks/useApi.js';
import { ENDPOINTS } from '../../lib/endpoints.js';
import { withQuery } from '../../lib/endpoints.js';
import { ApiErrorState } from '../../components/ContractPending.jsx';
import { Button, Card, Spinner } from '../../components/ui.jsx';

const STATUS = {
  pending: { icon: Clock, tone: 'blue', title: 'Under review', desc: 'We are verifying your details. This usually takes 1–2 business days.' },
  more_info: { icon: HelpCircle, tone: 'warn', title: 'More information needed', desc: 'Please check your email for the questions we need answered.' },
  approved: { icon: CheckCircle2, tone: 'ok', title: 'Approved', desc: 'Your institution is ready. Check your email for the invite to set your password.' },
  rejected: { icon: XCircle, tone: 'danger', title: 'Not approved', desc: 'We were unable to approve this application. The reason has been sent to the contact email.' },
};

export default function ApplicationStatus() {
  const [params] = useSearchParams();
  const token = params.get('token');
  const data = useApi(token ? withQuery(ENDPOINTS.public.status, { token }) : null);

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <Card className="max-w-md p-6 text-center">
          <p className="text-sm text-danger-ink">Missing or invalid status link.</p>
          <Link to="/" className="mt-4 inline-block"><Button variant="secondary">Back to home</Button></Link>
        </Card>
      </div>
    );
  }

  if (data.loading) return <div className="flex min-h-screen items-center justify-center"><Spinner size={24} /></div>;
  if (data.error) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-md space-y-3">
          <ApiErrorState error={data.error} onRetry={data.reload} />
          <Link to="/"><Button variant="secondary">Back to home</Button></Link>
        </div>
      </div>
    );
  }

  const payload = data.data || {};
  const cfg = STATUS[payload.status] || STATUS.pending;
  const Icon = cfg.icon;

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-4">
      <Card className="w-full max-w-md p-8 text-center">
        <div className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl ${cfg.tone === 'ok' ? 'bg-emerald-50 text-emerald-600' : cfg.tone === 'danger' ? 'bg-rose-50 text-rose-600' : cfg.tone === 'warn' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'}`}>
          <Icon size={28} />
        </div>
        <h1 className="text-xl font-semibold">{cfg.title}</h1>
        <p className="mt-2 text-sm text-muted">{cfg.desc}</p>
        {payload.institution_name && <p className="mt-4 rounded-lg bg-canvas px-4 py-2 text-sm font-medium">{payload.institution_name}</p>}
        {payload.status === 'approved' && (
          <Link to={payload.invite_url || '/login'} className="mt-6 block"><Button className="w-full">Continue to set password</Button></Link>
        )}
      </Card>
    </div>
  );
}
