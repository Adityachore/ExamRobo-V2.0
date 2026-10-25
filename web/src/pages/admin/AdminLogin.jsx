import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { api, auth } from '../../lib/api.js';
import { Banner, Button, Card, Field, Input, Logo } from '../../components/ui.jsx';

/** A1 — admin sign-in. Uses the admin-only token key; student tokens are untouched. */
export default function AdminLogin() {
  const nav = useNavigate();
  const loc = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(loc.state?.message ? { tone: 'info', text: loc.state.message } : null);

  useEffect(() => { if (auth.token('admin')) nav('/admin/events', { replace: true }); }, [nav]);

  const submit = async (e) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true); setError(null);
    try {
      const r = await api('/auth/admin', { method: 'POST', body: { email: email.trim(), password } });
      auth.set('admin', r.token, { email: r.email, name: r.name });
      nav(loc.state?.from || '/admin/events', { replace: true });
    } catch (ex) {
      setError({ tone: 'error', text: ex.status === 401 ? 'Email or password is incorrect.' : ex.status === 0 ? 'Sign-in could not be completed. Check your connection and try again.' : ex.message });
    } finally { setBusy(false); }
  };

  return (
    <div className="grid min-h-screen place-items-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex justify-center"><Logo /></div>
        <Card className="p-6">
          <h1 className="text-lg font-semibold">Admin sign in</h1>
          <p className="mt-1 text-sm text-muted">Access the ExamRobo admin workspace.</p>
          <form onSubmit={submit} className="mt-5 space-y-4" noValidate>
            <Field label="Email">{(p) => <Input {...p} type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} />}</Field>
            <Field label="Password">
              {(p) => (
                <div className="relative">
                  <Input {...p} type={show ? 'text' : 'password'} autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} className="pr-10" />
                  <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? 'Hide password' : 'Show password'} aria-pressed={show} className="absolute right-1.5 top-1.5 rounded-md p-1.5 text-muted hover:bg-slate-100">{show ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                </div>
              )}
            </Field>
            {error && <Banner tone={error.tone}>{error.text}</Banner>}
            <Button type="submit" className="w-full" loading={busy} disabled={!email || !password}>{busy ? 'Signing in…' : 'Sign in'}</Button>
          </form>
        </Card>
        <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-muted"><Lock size={12} aria-hidden />Secure admin access</p>
      </div>
    </div>
  );
}
