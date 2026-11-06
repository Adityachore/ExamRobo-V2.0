import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Eye, EyeOff, KeyRound, ShieldCheck } from 'lucide-react';
import { api, auth } from '../../lib/api.js';
import { ENDPOINTS } from '../../lib/endpoints.js';
import { Banner, Button, Card, Field, Input, useToast } from '../../components/ui.jsx';

export default function PlatformLogin() {
  const toast = useToast();
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [webauthnBusy, setWebauthnBusy] = useState(false);

  const passwordLogin = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setErr('Email and password are required.');
      return;
    }
    setBusy(true); setErr('');
    try {
      const r = await api(ENDPOINTS.auth.login, { method: 'POST', body: { email: email.trim(), password, surface: 'platform' } });
      const payload = r?.data ?? r;
      if (!payload?.token) throw new Error('Sign-in response did not include a session token.');
      auth.set('platform', payload.token, payload.profile || payload);
      toast('Signed in to platform');
      nav('/platform', { replace: true });
    } catch (ex) {
      setErr(ex.message || 'Invalid credentials or account locked.');
    } finally {
      setBusy(false);
    }
  };

  const webauthnLogin = async () => {
    setWebauthnBusy(true); setErr('');
    try {
      throw new Error('WebAuthn ceremony is not connected to the v2 contract yet.');
    } catch (ex) {
      setErr(ex.message);
    } finally {
      setWebauthnBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500 text-white"><ShieldCheck size={22} /></div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">Platform</h1>
          <p className="mt-1 text-sm text-slate-400">Super Admin access only</p>
        </div>

        <Card className="border-slate-800 bg-slate-900/80 p-6 shadow-xl">
          <form onSubmit={passwordLogin} noValidate className="space-y-4">
            {err && <Banner tone="error">{err}</Banner>}
            <Field label="Email">{(props) => <Input {...props} type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@platform.internal" className="border-slate-700 bg-slate-950 text-white" />}</Field>
            <Field label="Password">
              {(props) => (
                <div className="relative">
                  <Input {...props} type={showPw ? 'text' : 'password'} autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} className="border-slate-700 bg-slate-950 pr-10 text-white" />
                  <button type="button" onClick={() => setShowPw((v) => !v)} className="absolute right-3 top-3 text-slate-500 hover:text-white" tabIndex={-1} aria-label={showPw ? 'Hide password' : 'Show password'}>
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              )}
            </Field>
            <Button type="submit" loading={busy} className="w-full">Sign in with password</Button>
          </form>
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-700" /></div>
            <div className="relative flex justify-center text-xs"><span className="bg-slate-900 px-3 text-slate-500">or</span></div>
          </div>
          <Button type="button" variant="secondary" loading={webauthnBusy} onClick={webauthnLogin} className="w-full border-slate-700 bg-slate-800 text-white hover:bg-slate-700">
            <KeyRound size={16} className="mr-2" />Use security key / passkey
          </Button>
        </Card>
        <p className="mt-6 text-center text-xs text-slate-500">This host is restricted. All access is audited.</p>
      </div>
    </div>
  );
}
