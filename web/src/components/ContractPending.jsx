import { PlugZap, RefreshCw } from 'lucide-react';
import { Banner, Button, Card } from './ui.jsx';

export function isContractPending(error) {
  return error?.status === 404 || error?.status === 501 || error?.status === 503;
}

export function ContractPending({
  title = 'API not connected yet',
  description = 'This screen is built against the v2 contract. The endpoint is not available in this build, so live data is intentionally not shown.',
  error,
  onRetry,
}) {
  return (
    <Card className="overflow-hidden">
      <div className="border-b border-line bg-canvas/60 px-5 py-4">
        <div className="flex items-start gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary">
            <PlugZap size={18} aria-hidden />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-ink">{title}</h2>
            <p className="mt-1 max-w-xl text-sm text-muted">{description}</p>
          </div>
        </div>
      </div>
      <div className="space-y-3 p-5">
        {error?.code && (
          <p className="text-xs text-muted">
            Contract error: <code className="rounded bg-canvas px-1.5 py-0.5 text-ink">{error.code}</code>
            {error.status ? ` (HTTP ${error.status})` : ''}
          </p>
        )}
        {onRetry && (
          <Button size="sm" variant="secondary" onClick={onRetry}>
            <RefreshCw size={14} aria-hidden /> Retry
          </Button>
        )}
        <Banner tone="info" live={false}>
          No placeholder product data is shown. This page will populate when the documented API is enabled.
        </Banner>
      </div>
    </Card>
  );
}

export function ApiErrorState({ error, onRetry, title = 'Could not load this page' }) {
  if (isContractPending(error)) {
    return <ContractPending error={error} onRetry={onRetry} />;
  }
  return (
    <Banner tone="error" title={title}>
      {error?.message || 'Something went wrong.'}
      {onRetry && (
        <div className="mt-3">
          <Button size="sm" variant="secondary" onClick={onRetry}>
            <RefreshCw size={14} aria-hidden /> Retry
          </Button>
        </div>
      )}
    </Banner>
  );
}
