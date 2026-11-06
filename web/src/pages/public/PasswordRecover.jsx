import { useState } from 'react';
import { Link } from 'react-router';
import { Mail } from 'lucide-react';
import { api } from '../../lib/api.js';
import { ENDPOINTS } from '../../lib/endpoints.js';
import { Banner, Button, Card, Field, Input, useToast } from '../../components/ui.jsx';

export default function PasswordRecover() {
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return setErr('Enter your email.');
    setBusy(true); setErr('');
    try {
      await api(ENDPOINTS.auth.passwordForgot, { method: 'POST', body: { email: email.trim() } });
      setSent(true);
      toast('If an account exists, a reset link was sent.');
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
          <h1 className="text-2xl font-semibold">Reset password</h1>
          <p className="mt-1 text-sm text-muted">We&apos;ll email a link if the address is registered.</p>
        </div>
        <Card className="p-6">
          {sent ? (
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600"><Mail size={22} /></div>
              <p className="text-sm">Check your inbox for a reset link. It expires in 30 minutes.</p>
              <Link to="/login" className="mt-6 inline-block"><Button variant="secondary">Back to sign in</Button></Link>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              {err && <Banner tone="error">{err}</Banner>}
              <Field label="Email address">{(p) => <Input {...p} type="email" value={email} onChange={(e) => setEmail(e.target.value)} />}</Field>
              <Button type="submit" loading={busy} className="w-full">Send reset link</Button>
              <p className="text-center text-xs"><Link to="/login" className="text-primary hover:underline">Back to sign in</Link></p>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}
