import { Loader2, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { useConnectionStatus } from '../hooks/useConnectionStatus.js';
import { cx } from './ui.jsx';

const TONES = {
  online: 'bg-ok-soft text-ok-ink',
  degraded: 'bg-warn-soft text-warn-ink',
  offline: 'bg-danger-soft text-danger-ink',
  checking: 'bg-slate-100 text-slate-500',
};

const LABELS = {
  online: 'Online',
  degraded: 'Reconnecting',
  offline: 'Offline',
  checking: 'Checking',
};

export function ConnectionBadge({ className }) {
  const { state, check } = useConnectionStatus();
  const Icon = state === 'online' ? Wifi : state === 'checking' ? Loader2 : state === 'offline' ? WifiOff : RefreshCw;
  return (
    <button
      type="button"
      onClick={check}
      title={state === 'online' ? 'The exam server is reachable.' : 'Connection problem. Click to check again.'}
      className={cx(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors',
        TONES[state] || TONES.checking,
        className,
      )}
      role="status"
      aria-live="polite"
    >
      <Icon size={12} className={state === 'checking' ? 'animate-spin' : ''} aria-hidden />
      {LABELS[state] || LABELS.checking}
    </button>
  );
}
