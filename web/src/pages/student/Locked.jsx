import { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { ShieldAlert } from 'lucide-react';
import { auth } from '../../lib/api.js';
import { Banner, Button, Card, Logo } from '../../components/ui.jsx';

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
    <div className="relative min-h-screen overflow-hidden bg-bg">
      <div className="pointer-events-none absolute -left-32 -top-40 h-[28rem] w-[28rem] rounded-full bg-danger-soft/70 blur-3xl" aria-hidden />
      <div className="pointer-events-none absolute -bottom-40 right-0 h-96 w-96 rounded-full bg-ice/80 blur-3xl" aria-hidden />
      <div className="relative grid min-h-screen place-items-center px-4 py-8">
        <div className="w-full max-w-lg">
          <div className="mb-6 flex justify-center"><Logo /></div>
          <Card className="p-6 sm:p-8">
            <div className="flex items-start gap-4">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-danger-soft text-danger-ink"><ShieldAlert size={22} aria-hidden /></span>
              <div>
                <h1 className="text-xl font-semibold tracking-tight">Your exam was ended</h1>
                <p className="mt-1 text-sm leading-6 text-muted">This attempt was closed by the exam team or the integrity policy.</p>
              </div>
            </div>

            <Banner tone="error" className="mt-5" title={notice.label || 'Integrity violation'} live={false}>
              {notice.reason || 'A rule that protects exam integrity was triggered during your attempt.'}
            </Banner>

            <div className="mt-5 space-y-2.5 rounded-lg border border-line bg-canvas/60 p-4 text-sm leading-6 text-muted">
              <p>Your answers were submitted and graded as usual, so your work still counts.</p>
              <p>The exam team has been notified and will review the attempt before deciding what happens next.</p>
              <p>If you believe this was a mistake, contact the exam team and quote your email address.</p>
            </div>

            <Button className="mt-5 w-full" onClick={back}>Back to sign in</Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
