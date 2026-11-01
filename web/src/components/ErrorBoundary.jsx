import { Component } from 'react';

/**
 * Last line of defence. A render error must never leave the student on a blank
 * page mid-exam, so the boundary shows a recoverable screen instead of
 * unmounting the whole app. The server still owns the exam state: reloading the
 * page re-reads the paper and the answers that were already saved.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('[ui] render failed:', error, info?.componentStack);
  }

  reload = () => {
    window.location.reload();
  };

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="grid min-h-screen place-items-center bg-bg px-4 py-10">
        <div className="w-full max-w-md rounded-2xl border border-line bg-white p-6 text-center shadow-card" role="alert">
          <h1 className="text-lg font-semibold tracking-tight">This page could not be displayed</h1>
          <p className="mt-2 text-sm leading-6 text-muted">
            Your answers are saved on the server. Reload the page to continue. If this keeps happening, contact the exam team.
          </p>
          <button type="button" onClick={this.reload}
            className="mt-5 inline-flex h-10 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-white hover:bg-primary/90">
            Reload
          </button>
          <details className="mt-4 text-left">
            <summary className="cursor-pointer text-xs text-muted">Technical details</summary>
            <pre className="mt-2 overflow-auto rounded-lg bg-canvas p-3 text-[11px] leading-5 text-muted">{String(this.state.error?.message || this.state.error)}</pre>
          </details>
        </div>
      </div>
    );
  }
}
