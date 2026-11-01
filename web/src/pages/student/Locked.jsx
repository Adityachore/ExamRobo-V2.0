import { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { ArrowRight, ShieldAlert } from 'lucide-react';
import { auth } from '../../lib/api.js';
import { Banner, Logo } from '../../components/ui.jsx';
import { Aurora, GlowButton, Item, Reveal, Stagger } from '../../components/motion.jsx';

// The notice survives a page refresh, so the student always sees why the exam
// ended - even after the sign-in token has been cleared.
const STORE_KEY = 'examrobo_lock_notice';

export function rememberLockNotice(info) {
  try { sessionStorage.setItem(STORE_KEY, JSON.stringify(info || {})); } catch { /* storage blocked */ }
}

export function readLockNotice() {
  try { return JSON.parse(sessionStorage.getItem(STORE_KEY) || 'null'); } catch { return null; }
}

export function clearLockNotice() {
  try { sessionStorage.removeItem(STORE_KEY); } catch { /* ignore */ }
}

/**
 * The screen a student lands on after an integrity lockout. The exam is over:
 * the paper was submitted and graded, a MISCONDUCT flag was raised for the
 * exam team, and the sign-in token was cleared.
 */
export default function Locked({ notice: noticeProp } = {}) {
  const nav = useNavigate();
  const loc = useLocation();

  const notice = useMemo(() => {
    const stored = readLockNotice() || {};
    const state = loc.state || {};
    const merged = { ...stored, ...state, ...(noticeProp || {}) };
    return { ...merged, reason: merged.reason || null, label: merged.label || null };
  }, [loc.state, noticeProp]);

  const back = () => { clearLockNotice(); auth.clear('student'); nav('/', { replace: true }); };

  return (
    <div className="relative isolate grid min-h-screen place-items-center overflow-hidden px-4 py-10">
      <Aurora tone="red" />
      <div className="w-full max-w-md">
        <Reveal className="mb-6 flex justify-center"><Logo /></Reveal>
        <Stagger className="er-glass space-y-5 rounded-3xl p-7">
          <Item className="flex items-center gap-4">
            <span className="relative grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-danger-soft text-danger">
              <motion.span aria-hidden className="absolute inset-0 rounded-2xl border border-danger/40" animate={{ scale: [1, 1.5], opacity: [0.6, 0] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }} />
              <ShieldAlert size={22} aria-hidden />
            </span>
            <div>
              <h1 className="text-xl font-semibold tracking-tight">Your exam was ended</h1>
              <p className="text-sm text-muted">This attempt was closed by the exam integrity policy.</p>
            </div>
          </Item>

          <Item>
            <Banner tone="error" title={notice.label || 'Integrity violation'} live={false}>
              {notice.reason || 'A rule that protects exam integrity was triggered during your attempt.'}
            </Banner>
          </Item>

          <Item as="ul" className="space-y-3 text-sm text-muted">
            {['Your answers were submitted and graded as usual, so your work still counts.', 'The exam team has been notified and will review the attempt before deciding what happens next.', 'If you believe this was a mistake, contact the exam team and quote your email address.'].map((t) => (
              <li key={t} className="flex gap-3"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-300" aria-hidden />{t}</li>
            ))}
          </Item>

          <Item><GlowButton className="w-full" onClick={back} shine={false}>Back to sign in<ArrowRight size={16} aria-hidden /></GlowButton></Item>
        </Stagger>
      </div>
    </div>
  );
}
