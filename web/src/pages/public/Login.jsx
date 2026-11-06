import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Eye, EyeOff, Lock, Mail, ShieldCheck } from 'lucide-react';
import { api, auth } from '../../lib/api.js';
import { ENDPOINTS } from '../../lib/endpoints.js';
import { Banner, Button, Card, Field, Input, Logo, useToast } from '../../components/ui.jsx';

export default function Login() {
  const toast = useToast();
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setErr('Enter your email and password.');
      return;
    }
    setBusy(true); setErr('');
    try {
      const r = await api(ENDPOINTS.auth.login, { method: 'POST', body: { email: email.trim(), password } });
      const payload = r?.data ?? r;
      if (!payload?.token) throw new Error('Sign-in response did not include a session token.');
      auth.set('admin', payload.token, payload.profile || payload);
      toast('Signed in');
      nav('/app', { replace: true });
    } catch (ex) {
      setErr(ex.message || 'Unable to sign in. Check your details and try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mb-5 flex justify-center"><Logo /></div>
          <h1 className="text-2xl font-semibold tracking-tight">Sign in</h1>
          <p className="mt-1 text-sm text-muted">Staff and platform administrators use this screen</p>
        </div>

        <Card className="p-6">
          <form onSubmit={submit} noValidate className="space-y-4">
            {err && <Banner tone="error">{err}</Banner>}
            <Field label="Email address">
              {(props) => (
                <div className="relative">
                  <Mail size={16} className="pointer-events-none absolute left-3 top-3.5 text-slate-400" />
                  <Input {...props} type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10" placeholder="you@institution.edu" />
                </div>
              )}
            </Field>
            <Field label="Password">
              {(props) => (
                <div className="relative">
                  <Lock size={16} className="pointer-events-none absolute left-3 top-3.5 text-slate-400" />
                  <Input {...props} type={showPw ? 'text' : 'password'} autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10 pr-10" />
                  <button type="button" onClick={() => setShowPw((v) => !v)} className="absolute right-3 top-3 text-slate-400 hover:text-ink" tabIndex={-1} aria-label={showPw ? 'Hide password' : 'Show password'}>
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              )}
            </Field>
            <Button type="submit" loading={busy} className="w-full">Sign in</Button>
            <div className="flex items-center justify-between text-sm">
              <Link to="/password/recover" className="text-primary hover:underline">Forgot password?</Link>
              <Link to="/" className="text-muted hover:text-ink">Student sign in</Link>
            </div>
          </form>
        </Card>

        <div className="mt-4 text-center text-sm">
          <Link to="/register" className="font-medium text-primary hover:underline">Register an institution</Link>
          <span className="mx-2 text-slate-300">·</span>
          <Link to="/platform/login" className="inline-flex items-center gap-1 font-medium text-primary hover:underline"><ShieldCheck size={14} /> Platform</Link>
        </div>
        <p className="mt-6 text-center text-xs text-muted">
          By continuing you agree to the <Link to="/terms" className="underline">Terms</Link> and <Link to="/privacy" className="underline">Privacy Notice</Link>.
        </p>
      </div>
    </div>
  );
}
