import { WifiOff, RefreshCw } from 'lucide-react';

export function OfflineBanner({ reconnecting = false, onRetry }) {
  return (
    <div className="fixed inset-x-0 top-0 z-[60] bg-amber-500 px-4 py-2 text-center text-sm font-medium text-white">
      <span className="inline-flex items-center gap-2">
        <WifiOff size={14} aria-hidden />
        {reconnecting ? 'Reconnecting…' : 'You are offline. Changes will sync when the connection returns.'}
        {onRetry && (
          <button type="button" onClick={onRetry} className="ml-2 inline-flex items-center gap-1 underline underline-offset-2">
            <RefreshCw size={12} aria-hidden /> Retry
          </button>
        )}
      </span>
    </div>
  );
}

export default OfflineBanner;
