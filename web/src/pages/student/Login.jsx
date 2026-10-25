import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { ArrowRight, Mail, ShieldCheck } from 'lucide-react';
import { api, auth, ApiError } from '../../lib/api.js';
import { Banner, Button, Field, Input, Logo, Modal, Textarea, cx, useToast } from '../../components/ui.jsx';
import { clock } from '../../lib/format.js';

const EMAIL_RE = /^\S+@\S+\.\S+$/;

function ContactTeam({ open, onClose, defaultEmail }) {
  const toast = useToast();
  const [email, setEmail] = useState(defaultEmail || '');
  const [reason, setReason] = useState('');
  const [errs, setErrs] = useState({});
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  useEffect(() => { if (open) { setEmail(defaultEmail || ''); setErrs({}); setErr(''); } }, [open, defaultEmail]);

  const submit = async (e) => {
    e.preventDefault();
    const x = {};
    if (!EMAIL_RE.test(email.trim())) x.email = 'Enter a valid email address.';
    if (reason.trim().length < 3) x.reason = 'Tell us briefly what you need help with.';
    setErrs(x); setErr('');
    if (Object.keys(x).length) return;
    setBusy(true);
    try {
      await api('/tickets', { method: 'POST', body: { email: email.trim(), reason: reason.trim() } });
      setReason(''); onClose(); toast('Your request has been sent.');
    } catch (ex) { setErr(ex.message); } finally { setBusy(false); }
  };
  return (
    <Modal open={open} onClose={onClose} title="Contact the exam team" description="We'll reply to the email address you enter.">
      <form onSubmit={submit} noValidate className="space-y-3">
        {err && <Banner tone="error">{err}</Banner>}
        <Field label="Email" error={errs.email}>{(p) => <Input {...p} type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />}</Field>
        <Field label="Reason" error={errs.reason}>{(p) => <Textarea {...p} rows={3} value={reason} onChange={(e) => setReason(e.target.value)} />}</Field>
        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={busy}>Send request</Button>
        </div>
      </form>
    </Modal>
  );
}

/** S1 — student sign-in. Eligibility and lockout are decided by the server only. */
export default function Login() {
  const nav = useNavigate();
  const loc = useLocation();
  const [email, setEmail] = useState('');
  const [emailErr, setEmailErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(loc.state?.message ? { text: loc.state.message, tone: 'info' } : null);
  const [lockedUntil, setLockedUntil] = useState(0);
  const [tick, setTick] = useState(Date.now());
  const [contact, setContact] = useState(false);

  useEffect(() => { if (auth.token('student')) nav('/waiting', { replace: true }); }, [nav]);
  useEffect(() => { if (!lockedUntil) return; const t = setInterval(() => setTick(Date.now()), 500); return () => clearInterval(t); }, [lockedUntil]);
  const lockLeft = Math.max(0, Math.ceil((lockedUntil - tick) / 1000)); // display only

  const submit = async (e) => {
    e.preventDefault();
    if (busy || lockLeft > 0) return;
    if (!EMAIL_RE.test(email.trim())) { setEmailErr('Enter a valid email address.'); return; }
    setEmailErr(''); setBusy(true); setError(null);
    try {
      const r = await api('/auth/student', { method: 'POST', body: { email: email.trim() } });
      auth.set('student', r.token, { email: r.email, name: r.name });
      nav('/waiting');
    } catch (ex) {
      if (ex.status === 429) {
        const s = ex.data.retryAfterSec || 900;
        setLockedUntil(Date.now() + s * 1000); setTick(Date.now());
        setError({ text: 'Too many attempts. Sign-in is locked for this email.', tone: 'error', lock: true });
      } else if (ex.status === 403) {
        const left = ex.data.attemptsLeft;
        setError({ text: ex.message, tone: 'error', extra: left != null ? `${left} ${left === 1 ? 'attempt' : 'attempts'} left.` : null });
      } else setError({ text: ex.message, tone: 'error', retry: ex instanceof ApiError && ex.status === 0 });
    } finally { setBusy(false); }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-bg">
      <div className="pointer-events-none absolute -left-32 -top-40 h-[28rem] w-[28rem] rounded-full bg-ice/80 blur-3xl" aria-hidden />
      <div className="pointer-events-none absolute -bottom-48 right-0 h-[26rem] w-[26rem] rounded-full bg-primary-soft/80 blur-3xl" aria-hidden />

      <main className="relative grid min-h-screen place-items-center px-4 py-6 sm:px-6 sm:py-10">
        <div className="grid w-full max-w-5xl overflow-hidden rounded-2xl border border-line bg-white shadow-card lg:grid-cols-[46%_54%]">
          <aside className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-ice via-primary-soft to-white p-10 lg:flex xl:p-12">
            <div className="pointer-events-none absolute -right-20 top-16 h-64 w-64 rounded-full border border-white/80" aria-hidden />
            <div className="pointer-events-none absolute -bottom-28 -left-20 h-72 w-72 rounded-full bg-white/50" aria-hidden />
            <div className="relative"><Logo /></div>

            <div className="relative py-10">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Secure online examinations</p>
              <h2 className="mt-3 text-[40px] font-semibold leading-[1.12] tracking-tight text-ink">Smarter Exams.<br />Safer Tomorrow.</h2>
              <p className="mt-4 max-w-sm text-[15px] leading-6 text-muted">A calm, focused place to take your assessment — with clear instructions and secure, monitored sessions.</p>

              <div className="relative mx-auto mt-9 h-48 w-full max-w-sm" aria-hidden>
                <div className="absolute inset-x-5 top-2 rounded-2xl border border-white/90 bg-white/80 p-5 shadow-card backdrop-blur-sm">
                  <div className="flex items-center justify-between border-b border-line pb-3">
                    <div className="flex items-center gap-2"><span className="grid h-7 w-7 place-items-center rounded-md bg-primary-soft text-primary"><ShieldCheck size={14} /></span><span className="text-sm font-medium text-ink">Exam session</span></div>
                    <span className="h-2 w-2 rounded-full bg-ok" />
                  </div>
                  <div className="mt-4 space-y-2"><div className="h-2 w-3/4 rounded-full bg-slate-200" /><div className="h-2 w-1/2 rounded-full bg-slate-200" /></div>
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    {[0, 1, 2, 3].map((i) => <div key={i} className={cx('h-7 rounded-md border', i === 1 ? 'border-primary/40 bg-primary-soft' : 'border-line bg-white')} />)}
                  </div>
                </div>
                <div className="absolute -bottom-1 right-1 flex items-center gap-2 rounded-xl bg-primary px-3.5 py-2 text-xs font-medium text-white shadow-[0_10px_24px_-10px_rgba(37,99,235,0.9)]"><ShieldCheck size={14} />Protected session</div>
              </div>
            </div>

            <div className="relative flex items-center gap-2 text-xs text-muted"><ShieldCheck size={14} className="text-primary" aria-hidden />Authorized candidates only.</div>
          </aside>

          <section className="relative flex flex-col justify-center px-6 py-10 sm:px-10 lg:px-14 lg:py-16">
            <div className="mb-8 lg:hidden"><Logo /></div>
            <div className="mx-auto w-full max-w-[360px]">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Candidate sign in</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight">Welcome Back</h1>
              <p className="mt-2 text-sm leading-6 text-muted">Sign in with the email address invited to your exam.</p>

              <form onSubmit={submit} noValidate className="mt-7 space-y-5">
                <Field label="Email address" error={emailErr}>
                  {(p) => (
                    <div className="relative">
                      <Mail size={16} className="pointer-events-none absolute left-3.5 top-3.5 text-muted" aria-hidden />
                      <Input {...p} type="email" inputMode="email" autoComplete="email" placeholder="you@example.com" className="pl-10" value={email} onChange={(e) => { setEmail(e.target.value); setEmailErr(''); }} disabled={lockLeft > 0} />
                    </div>
                  )}
                </Field>

                <div aria-live="polite">
                  {error && (
                    <Banner tone={error.tone} title={error.text}
                      action={error.retry ? <Button type="button" size="sm" variant="secondary" onClick={submit}>Retry</Button> : null}>
                      {error.extra}
                      {error.lock && lockLeft > 0 && <span className="tnum block">Try again in {clock(lockLeft)}. A support ticket was created for you.</span>}
                      {error.lock && lockLeft === 0 && <span className="block">You can try again now.</span>}
                    </Banner>
                  )}
                </div>

                <Button type="submit" size="lg" className="w-full" loading={busy} disabled={lockLeft > 0 || !email.trim()}>{busy ? 'Checking eligibility…' : <>Sign In<ArrowRight size={16} aria-hidden /></>}</Button>
              </form>

              <div className="mt-5 flex items-start gap-2.5 rounded-lg border border-line bg-canvas/60 px-3.5 py-3 text-xs leading-5 text-muted">
                <ShieldCheck size={15} className="mt-0.5 shrink-0 text-primary" aria-hidden />
                Your email is only used to find your exam assignment. Access is controlled by your exam team.
              </div>

              <p className="mt-6 text-center text-sm text-muted">Having trouble? <button type="button" onClick={() => setContact(true)} className="font-medium text-primary hover:underline">Contact Team</button></p>
              <p className="mt-3 text-center text-xs leading-5 text-muted">
                This exam may open in Safe Exam Browser.{' '}
                <button type="button" onClick={() => nav('/seb')} className="font-medium text-primary hover:underline">SEB setup</button>
              </p>
            </div>
          </section>
        </div>
      </main>
      <ContactTeam open={contact} onClose={() => setContact(false)} defaultEmail={email} />
    </div>
  );
}
