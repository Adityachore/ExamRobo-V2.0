import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Check, ChevronRight } from 'lucide-react';
import { api } from '../../lib/api.js';
import { useApi } from '../../hooks/useApi.js';
import { ENDPOINTS } from '../../lib/endpoints.js';
import { Banner, Button, Card, Field, Input, PageHeader, Spinner, useToast } from '../../components/ui.jsx';

const STEPS = ['Confirm institution', 'Profile & contacts', 'Invite first employee'];

export default function Onboarding() {
  const toast = useToast();
  const nav = useNavigate();
  const profile = useApi(ENDPOINTS.institution.profile);
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [form, setForm] = useState({ logo: null, phone: '', secondary_email: '', invite_email: '', invite_name: '' });
  const set = (k, v) => setForm((s) => ({ ...s, [k]: v }));

  const finish = async () => {
    setBusy(true); setErr('');
    try {
      await api(ENDPOINTS.institution.profile, {
        method: 'PATCH',
        role: 'admin',
        body: { support_phone: form.phone, secondary_email: form.secondary_email },
      });
      if (form.invite_email.trim()) {
        await api(ENDPOINTS.institution.employees, {
          method: 'POST',
          role: 'admin',
          body: { email: form.invite_email.trim(), name: form.invite_name.trim() },
        });
      }
      toast('Onboarding complete.');
      nav('/app', { replace: true });
    } catch (ex) {
      setErr(ex.message);
    } finally {
      setBusy(false);
    }
  };

  if (profile.loading) return <div className="flex h-64 items-center justify-center"><Spinner /></div>;
  const p = profile.data || {};

  return (
    <>
      <PageHeader title="Welcome — finish setup" description="Confirm your institution, add contact details and invite your first employee." />
      <div className="mx-auto max-w-xl">
        <div className="mb-8 flex justify-between">
          {STEPS.map((label, i) => (
            <div key={label} className="flex flex-1 flex-col items-center">
              <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${i < step ? 'bg-primary text-white' : i === step ? 'bg-primary-soft text-primary ring-2 ring-primary' : 'bg-slate-100 text-muted'}`}>
                {i < step ? <Check size={14} /> : i + 1}
              </div>
              <span className="mt-1 hidden text-center text-[11px] text-muted sm:block">{label}</span>
            </div>
          ))}
        </div>
        <Card className="p-6">
          {err && <Banner tone="error" className="mb-4">{err}</Banner>}
          {step === 0 && (
            <div className="space-y-2 text-center">
              <p className="font-medium">{p.name || 'Institution'}</p>
              <p className="text-sm text-muted">{p.email || 'Contact email will appear here when the profile API is connected.'}</p>
              <p className="text-xs text-muted">You can edit these details later in Settings.</p>
            </div>
          )}
          {step === 1 && (
            <div className="space-y-4">
              <Field label="Institution logo (optional)">{(props) => <Input {...props} type="file" accept="image/*" onChange={(e) => set('logo', e.target.files?.[0] || null)} />}</Field>
              <Field label="Support phone">{(props) => <Input {...props} value={form.phone} onChange={(e) => set('phone', e.target.value)} />}</Field>
              <Field label="Secondary contact email">{(props) => <Input {...props} type="email" value={form.secondary_email} onChange={(e) => set('secondary_email', e.target.value)} />}</Field>
            </div>
          )}
          {step === 2 && (
            <div className="space-y-4">
              <p className="text-sm text-muted">Invite your first employee. You can skip this step.</p>
              <Field label="Name">{(props) => <Input {...props} value={form.invite_name} onChange={(e) => set('invite_name', e.target.value)} />}</Field>
              <Field label="Email">{(props) => <Input {...props} type="email" value={form.invite_email} onChange={(e) => set('invite_email', e.target.value)} />}</Field>
            </div>
          )}
          <div className="mt-6 flex justify-between border-t border-line pt-4">
            <Button variant="secondary" disabled={step === 0} onClick={() => setStep((s) => s - 1)}>Back</Button>
            <Button loading={busy} onClick={() => (step === 2 ? finish() : setStep((s) => s + 1))}>
              {step === 2 ? 'Finish' : 'Continue'} <ChevronRight size={16} className="ml-1" />
            </Button>
          </div>
        </Card>
      </div>
    </>
  );
}
