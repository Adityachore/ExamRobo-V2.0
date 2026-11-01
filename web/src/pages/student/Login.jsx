import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { Activity, ArrowRight, Lock, Mail, ShieldCheck } from 'lucide-react';
import { api, auth, ApiError } from '../../lib/api.js';
import { Banner, Button, Field, Input, Logo, Modal, Textarea, useToast } from '../../components/ui.jsx';
import { Aurora, GlowButton, Item, ProductPreview, Reveal, Stagger } from '../../components/motion.jsx';
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
    if (!EMAIL_RE.test(email.trim())) { setError({ text: 'Enter a valid email address.', tone: 'error' }); return; }
    setBusy(true); setError(null);
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

  const features = [[ShieldCheck, 'Secure', 'Your data, our priority'], [Activity, 'Real-time', 'Live monitoring'], [Lock, 'Saved', 'Every answer, instantly']];
  const [focus, setFocus] = useState(false);

  return (
    <div className="relative isolate grid min-h-screen overflow-hidden lg:grid-cols-[1.15fr_1fr]">
      <Aurora />
      <aside className="hidden flex-col justify-between p-12 lg:flex xl:p-16">
        <Reveal><Logo /></Reveal>
        <Stagger className="max-w-lg">
          <Item as="h2" className="text-5xl font-light leading-[1.1] tracking-tight xl:text-6xl">Your skills.<br /><span className="er-grad-text font-semibold">Our focus.</span></Item>
          <Item as="p" className="mt-5 max-w-sm text-lg text-muted">A modern proctored exam platform for a fair and secure assessment.</Item>
          <Item className="mt-9 flex flex-wrap gap-x-7 gap-y-4">
            {features.map(([Icon, t, d], i) => (
              <motion.div key={t} whileHover={{ y: -3 }} className="flex items-center gap-3">
                <span className="er-glass grid h-11 w-11 place-items-center rounded-full text-primary"><Icon size={18} aria-hidden /></span>
                <span><span className="block text-sm font-medium">{t}</span><span className="block text-xs text-muted">{d}</span></span>
              </motion.div>
            ))}
          </Item>
        </Stagger>
        <div className="pr-10"><ProductPreview className="mx-auto max-w-md" /></div>
      </aside>

      <main className="relative grid place-items-center px-4 py-10">
        <div className="w-full max-w-md">
          <Reveal className="mb-6 lg:hidden"><Logo /></Reveal>
          <motion.div initial={{ opacity: 0, y: 24, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }} className="er-glass rounded-3xl p-8">
            <h1 className="text-2xl font-semibold tracking-tight">Welcome back <motion.span className="inline-block origin-[70%_70%]" animate={{ rotate: [0, 16, -8, 14, 0] }} transition={{ duration: 1.6, delay: 0.9 }} aria-hidden>👋</motion.span></h1>
            <p className="mt-1.5 text-muted">Sign in with the email address invited to your exam.</p>
            <form onSubmit={submit} noValidate className="mt-6 space-y-4">
              <Field label="Email address">
                {(p) => (
                  <div className={'relative rounded-xl transition-shadow ' + (focus ? 'shadow-[0_0_0_4px_rgb(37_99_235/.12)]' : '')}>
                    <Mail size={16} className="pointer-events-none absolute left-3.5 top-3.5 text-slate-400" aria-hidden />
                    <Input {...p} type="email" inputMode="email" autoComplete="email" placeholder="you@example.com" className="h-11 rounded-xl pl-10" value={email} onChange={(e) => setEmail(e.target.value)} onFocus={() => setFocus(true)} onBlur={() => setFocus(false)} disabled={lockLeft > 0} />
                  </div>
                )}
              </Field>
              <div aria-live="polite">
                {error && (
                  <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}>
                    <Banner tone={error.tone} title={error.text}
                      action={error.retry ? <Button size="sm" variant="secondary" onClick={submit}>Retry</Button> : null}>
                      {error.extra}
                      {error.lock && lockLeft > 0 && <span className="tnum block">Try again in {clock(lockLeft)}. A support ticket was created for you.</span>}
                      {error.lock && lockLeft === 0 && <span className="block">You can try again now.</span>}
                    </Banner>
                  </motion.div>
                )}
              </div>
              <GlowButton type="submit" className="w-full" loading={busy} disabled={lockLeft > 0 || !email.trim()}>
                {busy ? 'Checking eligibility…' : <>Continue<ArrowRight size={16} aria-hidden /></>}
              </GlowButton>
            </form>
            <div className="mt-6 border-t border-line/70 pt-4 text-center text-sm text-muted">Having trouble? <button type="button" onClick={() => setContact(true)} className="font-medium text-primary hover:underline">Contact Team</button></div>
            <p className="mt-3 text-center text-xs leading-5 text-muted">
              This exam may open in Safe Exam Browser.{' '}
              <button type="button" onClick={() => nav('/seb')} className="font-medium text-primary hover:underline">SEB setup</button>
            </p>
          </motion.div>
          <p className="mt-5 flex items-center justify-center gap-1.5 text-xs text-muted"><Lock size={12} aria-hidden />Secure exams. Fair results.</p>
        </div>
      </main>
      <ContactTeam open={contact} onClose={() => setContact(false)} defaultEmail={email} />
    </div>
  );
}
