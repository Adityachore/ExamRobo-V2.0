import { useEffect, useState } from 'react';
import { useApi } from '../../hooks/useApi.js';
import { api } from '../../lib/api.js';
import { ENDPOINTS } from '../../lib/endpoints.js';
import { ApiErrorState } from '../../components/ContractPending.jsx';
import { Banner, Button, Card, Field, Input, PageHeader, Spinner, useToast } from '../../components/ui.jsx';

export default function Settings() {
  const toast = useToast();
  const data = useApi(ENDPOINTS.institution.profile);
  const [form, setForm] = useState({ name: '', email: '', phone: '', support_phone: '', secondary_email: '' });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    if (data.data) setForm((f) => ({ ...f, ...data.data }));
  }, [data.data]);

  const set = (k, v) => setForm((s) => ({ ...s, [k]: v }));
  const save = async (e) => {
    e.preventDefault();
    setBusy(true); setErr('');
    try {
      await api(ENDPOINTS.institution.profile, { method: 'PATCH', role: 'admin', body: form });
      toast('Settings saved.');
      data.reload();
    } catch (ex) { setErr(ex.message); }
    finally { setBusy(false); }
  };

  if (data.loading) return <div className="flex h-64 items-center justify-center"><Spinner /></div>;
  if (data.error) return <ApiErrorState error={data.error} onRetry={data.reload} />;

  return (
    <>
      <PageHeader title="Institution settings" description="Profile, contacts and branding. Elite subdomain is read-only." />
      <Card className="max-w-2xl p-6">
        <form onSubmit={save} className="space-y-4">
          {err && <Banner tone="error">{err}</Banner>}
          <Field label="Institution name">{(p) => <Input {...p} value={form.name || ''} onChange={(e) => set('name', e.target.value)} />}</Field>
          <Field label="Contact email">{(p) => <Input {...p} type="email" value={form.email || ''} onChange={(e) => set('email', e.target.value)} />}</Field>
          <Field label="Phone">{(p) => <Input {...p} value={form.phone || ''} onChange={(e) => set('phone', e.target.value)} />}</Field>
          <Field label="Support phone">{(p) => <Input {...p} value={form.support_phone || ''} onChange={(e) => set('support_phone', e.target.value)} />}</Field>
          <Field label="Secondary contact email">{(p) => <Input {...p} type="email" value={form.secondary_email || ''} onChange={(e) => set('secondary_email', e.target.value)} />}</Field>
          <Field label="Elite subdomain" hint="Read-only. Custom domains are not available in v2.0.">{(p) => <Input {...p} value={form.subdomain || 'Shared path'} disabled />}</Field>
          <Button type="submit" loading={busy}>Save settings</Button>
        </form>
      </Card>
    </>
  );
}
