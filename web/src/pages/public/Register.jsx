import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Building2, Check, ChevronRight, Mail, User } from 'lucide-react';
import { api } from '../../lib/api.js';
import { ENDPOINTS } from '../../lib/endpoints.js';
import { Banner, Button, Card, Field, Input, Select, Textarea, useToast } from '../../components/ui.jsx';

const STEPS = [
  { id: 'institution', title: 'Institution', icon: Building2 },
  { id: 'contact', title: 'Leadership', icon: User },
  { id: 'verify', title: 'Verification', icon: Mail },
  { id: 'review', title: 'Review', icon: Check },
];

export default function Register() {
  const toast = useToast();
  const nav = useNavigate();
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [applicationId, setApplicationId] = useState(null);
  const [form, setForm] = useState({
    institution_name: '', type: 'college', address: '', city: '', state: '',
    owner_name: '', owner_email: '', owner_phone: '', designation: '',
    email_otp: '', phone_otp: '', accept_terms: false,
  });
  const set = (k, v) => setForm((s) => ({ ...s, [k]: v }));

  const next = async () => {
    setErr('');
    if (step === 0 && !form.institution_name.trim()) return setErr('Institution name is required.');
    if (step === 1 && (!form.owner_name.trim() || !form.owner_email.trim() || !form.owner_phone.trim())) {
      return setErr('All leadership fields are required.');
    }
    if (step === 2 && !otpSent) {
      setBusy(true);
      try {
        const created = await api(ENDPOINTS.public.applications, { method: 'POST', body: form });
        const payload = created?.data ?? created;
        const id = payload?.id || payload?.application?.id;
        if (!id) throw new Error('Registration response did not include an application id.');
        setApplicationId(id);
        await api(ENDPOINTS.public.otpRequest(id), { method: 'POST', body: { email: form.owner_email, phone: form.owner_phone } });
        setOtpSent(true);
        toast('OTP sent to email and phone');
      } catch (ex) {
        setErr(ex.message);
      } finally {
        setBusy(false);
      }
      return;
    }
    if (step === 2 && otpSent && (!form.email_otp || !form.phone_otp)) return setErr('Enter both OTPs.');
    if (step === 3) {
      if (!form.accept_terms) return setErr('You must accept the Terms and Privacy Notice.');
      setBusy(true);
      try {
        const verified = await api(ENDPOINTS.public.otpVerify(applicationId), {
          method: 'POST',
          body: { email_otp: form.email_otp, phone_otp: form.phone_otp },
        });
        const payload = verified?.data ?? verified;
        const token = payload?.status_token || payload?.token;
        toast('Application submitted');
        nav(token ? `/application/status?token=${encodeURIComponent(token)}` : '/application/status?token=pending', { replace: true });
      } catch (ex) {
        setErr(ex.message);
      } finally {
        setBusy(false);
      }
      return;
    }
    setStep((s) => s + 1);
  };

  return (
    <div className="min-h-screen bg-canvas px-4 py-10">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Register your institution</h1>
          <p className="mt-1 text-sm text-muted">Takes about 4 minutes. You will receive a decision by email.</p>
        </div>

        <div className="mb-8 flex items-center justify-between">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex flex-1 items-center">
              <div className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-medium ${i < step ? 'bg-primary text-white' : i === step ? 'bg-primary-soft text-primary ring-2 ring-primary' : 'bg-slate-100 text-muted'}`}>
                {i < step ? <Check size={16} /> : i + 1}
              </div>
              {i < STEPS.length - 1 && <div className={`mx-2 h-0.5 flex-1 ${i < step ? 'bg-primary' : 'bg-slate-200'}`} />}
            </div>
          ))}
        </div>

        <Card className="p-6">
          {err && <Banner tone="error" className="mb-4">{err}</Banner>}
          {step === 0 && (
            <div className="space-y-4">
              <Field label="Institution name">{(p) => <Input {...p} value={form.institution_name} onChange={(e) => set('institution_name', e.target.value)} />}</Field>
              <Field label="Type">
                {(p) => (
                  <Select {...p} value={form.type} onChange={(e) => set('type', e.target.value)}>
                    <option value="college">College / University</option>
                    <option value="school">School</option>
                    <option value="training">Training institute</option>
                    <option value="corporate">Corporate</option>
                  </Select>
                )}
              </Field>
              <Field label="Address">{(p) => <Textarea {...p} rows={2} value={form.address} onChange={(e) => set('address', e.target.value)} />}</Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="City">{(p) => <Input {...p} value={form.city} onChange={(e) => set('city', e.target.value)} />}</Field>
                <Field label="State">{(p) => <Input {...p} value={form.state} onChange={(e) => set('state', e.target.value)} />}</Field>
              </div>
            </div>
          )}
          {step === 1 && (
            <div className="space-y-4">
              <Field label="Full name of primary contact">{(p) => <Input {...p} value={form.owner_name} onChange={(e) => set('owner_name', e.target.value)} />}</Field>
              <Field label="Designation">{(p) => <Input {...p} value={form.designation} onChange={(e) => set('designation', e.target.value)} placeholder="Principal / Dean / HR Head" />}</Field>
              <Field label="Work email">{(p) => <Input {...p} type="email" value={form.owner_email} onChange={(e) => set('owner_email', e.target.value)} />}</Field>
              <Field label="Mobile number">{(p) => <Input {...p} type="tel" value={form.owner_phone} onChange={(e) => set('owner_phone', e.target.value)} placeholder="+91" />}</Field>
            </div>
          )}
          {step === 2 && (
            <div className="space-y-4">
              {!otpSent ? (
                <p className="text-sm text-muted">We will send a one-time code to <strong>{form.owner_email}</strong> and <strong>{form.owner_phone}</strong>.</p>
              ) : (
                <>
                  <Field label="Email OTP">{(p) => <Input {...p} value={form.email_otp} onChange={(e) => set('email_otp', e.target.value)} className="tnum tracking-widest" maxLength={6} />}</Field>
                  <Field label="SMS OTP">{(p) => <Input {...p} value={form.phone_otp} onChange={(e) => set('phone_otp', e.target.value)} className="tnum tracking-widest" maxLength={6} />}</Field>
                </>
              )}
            </div>
          )}
          {step === 3 && (
            <div className="space-y-4">
              <div className="rounded-lg border border-line bg-canvas/50 p-4 text-sm">
                <p><span className="text-muted">Institution:</span> {form.institution_name}</p>
                <p className="mt-1"><span className="text-muted">Type:</span> {form.type}</p>
                <p className="mt-1"><span className="text-muted">Contact:</span> {form.owner_name} · {form.owner_email}</p>
              </div>
              <label className="flex items-start gap-3 text-sm">
                <input type="checkbox" checked={form.accept_terms} onChange={(e) => set('accept_terms', e.target.checked)} className="mt-0.5 h-4 w-4 rounded border-line" />
                <span>I accept the <Link to="/terms" className="text-primary underline">Terms of Service</Link> and <Link to="/privacy" className="text-primary underline">Privacy Notice</Link>.</span>
              </label>
            </div>
          )}
          <div className="mt-6 flex justify-between border-t border-line pt-4">
            <Button type="button" variant="secondary" disabled={step === 0} onClick={() => setStep((s) => s - 1)}>Back</Button>
            <Button type="button" loading={busy} onClick={next}>
              {step === 3 ? 'Submit application' : step === 2 && !otpSent ? 'Send OTP' : 'Continue'}
              {step < 3 && <ChevronRight size={16} className="ml-1" />}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
