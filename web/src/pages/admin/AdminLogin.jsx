import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { ArrowRight, Eye, EyeOff, LayoutDashboard, Lock, Mail, ShieldCheck, Users, Zap } from 'lucide-react';
import { api, auth } from '../../lib/api.js';
import { Banner, Field, Input, Logo } from '../../components/ui.jsx';
import { Aurora, GlowButton, Item, ProductPreview, Reveal, Stagger } from '../../components/motion.jsx';

const FEATURES = [[ShieldCheck, 'Secure', 'Your data, our priority'], [Zap, 'Fast', 'Built for efficiency'], [Users, 'Reliable', 'Always available']];

/** A1 — admin sign-in. Uses the admin-only token key; student tokens are untouched. */
export default function AdminLogin() {
  const nav = useNavigate();
  const loc = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(loc.state?.message ? { tone: 'info', text: loc.state.message } : null);
  const [focus, setFocus] = useState('');

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
  const ring = (k) => 'relative rounded-xl transition-shadow ' + (focus === k ? 'shadow-[0_0_0_4px_rgb(37_99_235/.12)]' : '');

  return (
    <div className="relative isolate grid min-h-screen overflow-hidden lg:grid-cols-[1.15fr_1fr]">
      <Aurora />
      <aside className="hidden flex-col justify-between p-12 lg:flex xl:p-16">
        <Reveal><Logo sub="Admin console" className="text-2xl" /></Reveal>
        <Stagger className="max-w-xl">
          <Item as="h2" className="text-5xl font-light leading-[1.1] tracking-tight xl:text-6xl">Better Exams.<br /><span className="er-grad-text font-semibold">Brighter Futures.</span></Item>
          <Item as="p" className="mt-5 max-w-sm text-lg text-muted">Manage, monitor and streamline your ExamRobo platform from here.</Item>
          <Item className="mt-9 flex flex-wrap gap-x-7 gap-y-4">
            {FEATURES.map(([Icon, t, d]) => (
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
          <Reveal className="mb-6 lg:hidden"><Logo sub="Admin console" /></Reveal>
          <motion.div initial={{ opacity: 0, y: 24, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }} className="er-glass rounded-3xl p-8">
            <span className="mb-4 grid h-11 w-11 place-items-center rounded-2xl bg-primary-soft text-primary"><LayoutDashboard size={20} aria-hidden /></span>
            <h1 className="text-2xl font-semibold tracking-tight">Welcome back <motion.span className="inline-block origin-[70%_70%]" animate={{ rotate: [0, 16, -8, 14, 0] }} transition={{ duration: 1.6, delay: 0.9 }} aria-hidden>👋</motion.span></h1>
            <p className="mt-1.5 text-muted">Sign in to access your admin workspace and manage everything with ease.</p>
            <form onSubmit={submit} className="mt-6 space-y-4" noValidate>
              <Field label="Email address">
                {(p) => (
                  <div className={ring('e')}>
                    <Mail size={16} className="pointer-events-none absolute left-3.5 top-3.5 text-slate-400" aria-hidden />
                    <Input {...p} type="email" autoComplete="username" placeholder="admin@examrobo.dev" className="h-11 rounded-xl pl-10" value={email} onChange={(e) => setEmail(e.target.value)} onFocus={() => setFocus('e')} onBlur={() => setFocus('')} />
                  </div>
                )}
              </Field>
              <Field label="Password">
                {(p) => (
                  <div className={ring('p')}>
                    <Lock size={16} className="pointer-events-none absolute left-3.5 top-3.5 text-slate-400" aria-hidden />
                    <Input {...p} type={show ? 'text' : 'password'} autoComplete="current-password" placeholder="Enter your password" className="h-11 rounded-xl pl-10 pr-11" value={password} onChange={(e) => setPassword(e.target.value)} onFocus={() => setFocus('p')} onBlur={() => setFocus('')} />
                    <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? 'Hide password' : 'Show password'} aria-pressed={show} className="absolute right-2 top-2 rounded-lg p-1.5 text-muted hover:bg-slate-100">{show ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                  </div>
                )}
              </Field>
              <div aria-live="polite">{error && <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}><Banner tone={error.tone}>{error.text}</Banner></motion.div>}</div>
              <GlowButton type="submit" className="w-full" loading={busy} disabled={!email || !password}>{busy ? 'Signing in…' : <><ArrowRight size={16} aria-hidden />Sign in</>}</GlowButton>
            </form>
            <p className="mt-6 flex items-center justify-center gap-1.5 border-t border-line/70 pt-4 text-xs text-muted"><Lock size={12} aria-hidden />Protected admin access</p>
          </motion.div>
          <p className="mt-5 text-center text-xs text-muted">© 2026 ExamRobo. All rights reserved.</p>
        </div>
      </main>
    </div>
  );
}
