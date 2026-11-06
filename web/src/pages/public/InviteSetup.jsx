import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { Check, Eye, EyeOff } from 'lucide-react';
import { api } from '../../lib/api.js';
import { ENDPOINTS } from '../../lib/endpoints.js';
import { Banner, Button, Card, Field, Input, useToast } from '../../components/ui.jsx';

export default function InviteSetup() {
  const toast = useToast();
  const nav = useNavigate();
  const { token } = useParams();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    if (!token) return setErr('This invite link is incomplete.');
    if (password.length < 10) return setErr('Password must be at least 10 characters.');
    if (password !== confirm) return setErr('Passwords do not match.');
    setBusy(true); setErr('');
    try {
      await api(ENDPOINTS.auth.passwordReset, { method: 'POST', body: { token, password } });
      toast('Password set. You can now sign in.');
      nav('/login', { replace: true });
    } catch (ex) {
      setErr(ex.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold">Set your password</h1>
          <p className="mt-1 text-sm text-muted">Use the one-time invite link from your institution email.</p>
        </div>
        <Card className="p-6">
          <form onSubmit={submit} className="space-y-4">
            {err && <Banner tone="error">{err}</Banner>}
            <Field label="New password">
              {(p) => (
                <div className="relative">
                  <Input {...p} type={show ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} className="pr-10" />
                  <button type="button" onClick={() => setShow((v) => !v)} className="absolute right-3 top-3 text-slate-400" aria-label={show ? 'Hide password' : 'Show password'}>{show ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                </div>
              )}
            </Field>
            <Field label="Confirm password">{(p) => <Input {...p} type={show ? 'text' : 'password'} value={confirm} onChange={(e) => setConfirm(e.target.value)} />}</Field>
            <ul className="space-y-1 text-xs text-muted">
              <li className="flex items-center gap-2"><Check size={12} className={password.length >= 10 ? 'text-emerald-600' : ''} /> At least 10 characters</li>
              <li className="flex items-center gap-2"><Check size={12} className={password && password === confirm ? 'text-emerald-600' : ''} /> Passwords match</li>
            </ul>
            <Button type="submit" loading={busy} className="w-full">Set password &amp; continue</Button>
            <p className="text-center text-xs text-muted">If your invite expired, ask your institution Owner or Admin to resend it.</p>
            <p className="text-center text-xs"><Link to="/login" className="text-primary hover:underline">Back to sign in</Link></p>
          </form>
        </Card>
      </div>
    </div>
  );
}
