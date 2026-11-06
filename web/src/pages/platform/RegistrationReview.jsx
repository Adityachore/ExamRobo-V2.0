import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { api } from '../../lib/api.js';
import { useApi } from '../../hooks/useApi.js';
import { ENDPOINTS } from '../../lib/endpoints.js';
import { fmtDateTime } from '../../lib/format.js';
import { ApiErrorState } from '../../components/ContractPending.jsx';
import { Banner, Button, Card, Field, PageHeader, Select, Spinner, Textarea, useToast } from '../../components/ui.jsx';

export default function RegistrationReview() {
  const { id } = useParams();
  const nav = useNavigate();
  const toast = useToast();
  const data = useApi(id ? ENDPOINTS.platform.application(id) : null, 'platform');
  const [decision, setDecision] = useState('approve');
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const submit = async () => {
    if (decision !== 'approve' && !reason.trim()) return setErr('A reason is required.');
    if (decision === 'request_info') return setErr('The request-information endpoint is not defined in the v2 catalog yet.');
    setBusy(true); setErr('');
    try {
      const path = decision === 'approve' ? ENDPOINTS.platform.approve(id) : ENDPOINTS.platform.reject(id);
      await api(path, { method: 'POST', role: 'platform', body: { reason: reason.trim() } });
      toast(decision === 'approve' ? 'Institution approved. Invite queued.' : 'Decision recorded.');
      nav('/platform/registrations', { replace: true });
    } catch (ex) {
      setErr(ex.message);
    } finally {
      setBusy(false);
    }
  };

  if (data.loading) return <div className="flex h-64 items-center justify-center"><Spinner /></div>;
  if (data.error) return <ApiErrorState error={data.error} onRetry={data.reload} />;
  const r = data.data || {};

  return (
    <>
      <PageHeader title={r.institution_name || 'Registration'} description={`Submitted ${fmtDateTime(r.submitted_at)}`} />
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="space-y-4 p-5 lg:col-span-2">
          <h2 className="text-sm font-semibold">Application</h2>
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <div><dt className="text-muted">Type</dt><dd className="font-medium">{r.type || '—'}</dd></div>
            <div><dt className="text-muted">City / State</dt><dd className="font-medium">{[r.city, r.state].filter(Boolean).join(', ') || '—'}</dd></div>
            <div><dt className="text-muted">Owner</dt><dd className="font-medium">{r.owner_name || '—'}</dd></div>
            <div><dt className="text-muted">Email</dt><dd className="font-medium">{r.owner_email || '—'}</dd></div>
            <div><dt className="text-muted">Phone</dt><dd className="font-medium">{r.owner_phone || '—'}</dd></div>
            <div><dt className="text-muted">Designation</dt><dd className="font-medium">{r.designation || '—'}</dd></div>
          </dl>
          {r.address && <p className="text-sm text-muted">{r.address}</p>}
          <Link to="/platform/registrations" className="inline-block text-sm font-medium text-primary hover:underline">Back to queue</Link>
        </Card>
        <Card className="p-5">
          <h2 className="mb-3 text-sm font-semibold">Decision</h2>
          {err && <Banner tone="error" className="mb-3">{err}</Banner>}
          <Field label="Action">{(p) => (
            <Select {...p} value={decision} onChange={(e) => setDecision(e.target.value)}>
              <option value="approve">Approve &amp; start Trial</option>
              <option value="request_info">Request more information</option>
              <option value="reject">Reject</option>
            </Select>
          )}</Field>
          <Field label="Reason / notes" className="mt-3">{(p) => <Textarea {...p} rows={4} value={reason} onChange={(e) => setReason(e.target.value)} />}</Field>
          <Button className="mt-4 w-full" loading={busy} onClick={submit} variant={decision === 'reject' ? 'danger' : 'primary'}>Confirm decision</Button>
        </Card>
      </div>
    </>
  );
}
