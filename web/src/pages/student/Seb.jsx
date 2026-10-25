import { useEffect, useState } from 'react';
import { ArrowLeft, CheckCircle2, CircleAlert, Download, ShieldCheck } from 'lucide-react';
import { api } from '../../lib/api.js';
import { Banner, Button, Card, Logo, Spinner } from '../../components/ui.jsx';
import { isSebBrowser, sebDownloadHref } from '../../lib/seb.js';

export default function Seb() {
  const inSeb = isSebBrowser();
  const [status, setStatus] = useState({ state: 'loading' });
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    api('/seb/status')
      .then((r) => { if (alive) setStatus({ state: 'ok', ...r }); })
      .catch((e) => { if (alive) { setStatus({ state: 'error' }); setError(e.message); } });
    return () => { alive = false; };
  }, []);

  const ready = status.state === 'ok' && status.configured;
  const go = (path) => window.location.assign(path);

  return (
    <div className="min-h-screen bg-bg">
      <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col justify-center px-4 py-10 sm:px-6">
        <div className="mb-6"><Logo /></div>
        <Card className="p-6 sm:p-8">
          <div className="flex items-start gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary"><ShieldCheck size={22} aria-hidden /></span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Secure exam setup</p>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">Open this exam in Safe Exam Browser</h1>
            </div>
          </div>

          {inSeb && (
            <Banner tone="ok" className="mt-6" title="Safe Exam Browser detected">
              You are running the exam in Safe Exam Browser. Sign in with your invited email address to continue.
              <div className="mt-3"><Button size="sm" onClick={() => go('/')}>Continue to sign in</Button></div>
            </Banner>
          )}

          {status.state === 'loading' && (
            <p className="mt-6 flex items-center gap-2 text-sm text-muted" role="status"><Spinner size={16} />Checking the exam configuration…</p>
          )}

          {status.state === 'error' && (
            <Banner tone="warn" className="mt-6" title="Could not check the Safe Exam Browser configuration.">{error}</Banner>
          )}

          {status.state === 'ok' && !status.required && (
            <Banner tone="info" className="mt-6" title="Safe Exam Browser is not required for this exam.">
              You can continue in your normal browser. If your exam team asked you to use SEB, download the configuration below.
            </Banner>
          )}

          {status.state === 'ok' && status.required && !status.configured && (
            <Banner tone="error" className="mt-6" title="The exam configuration is not ready.">
              The exam team has not finished setting up Safe Exam Browser. Contact them before the exam starts.
            </Banner>
          )}

          {status.state === 'ok' && status.required && status.configured && !inSeb && (
            <div className="mt-6 space-y-4">
              <p className="text-sm leading-6 text-body">
                This exam must be launched from the downloaded configuration file. The file contains the exact exam address and security settings; do not edit or rename it.
              </p>
              <ol className="space-y-2.5 text-sm leading-6 text-body">
                <li className="flex gap-3"><span className="tnum grid h-6 w-6 shrink-0 place-items-center rounded-full bg-canvas text-xs font-semibold text-primary">1</span><span>Download <span className="font-medium text-ink">exam.seb</span>.</span></li>
                <li className="flex gap-3"><span className="tnum grid h-6 w-6 shrink-0 place-items-center rounded-full bg-canvas text-xs font-semibold text-primary">2</span><span>Open the downloaded file. Safe Exam Browser will start and open the exam sign-in page.</span></li>
                <li className="flex gap-3"><span className="tnum grid h-6 w-6 shrink-0 place-items-center rounded-full bg-canvas text-xs font-semibold text-primary">3</span><span>Sign in again inside SEB. The exam starts only in that window.</span></li>
              </ol>
              <div className="flex flex-wrap gap-2">
                <a href={sebDownloadHref()} download="exam.seb" className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-ink">
                  <Download size={16} aria-hidden />Download exam.seb
                </a>
                <Button variant="secondary" onClick={() => go('/')}>Back to sign in</Button>
              </div>
              <p className="rounded-lg bg-canvas px-3 py-2.5 text-xs leading-5 text-muted">
                The exam team holds the SEB quit password. Do not open other applications, take screenshots, or use AI tools during the exam.
              </p>
            </div>
          )}

          {status.state === 'ok' && inSeb && (
            <div className="mt-5 flex flex-wrap items-center gap-2 text-sm text-muted">
              <CheckCircle2 size={16} className="text-ok" aria-hidden />
              <span>Let the exam team know if SEB shows an error.</span>
            </div>
          )}

          <div className="mt-6 flex items-center gap-2 text-xs leading-5 text-muted">
            <CircleAlert size={14} className="shrink-0 text-muted" aria-hidden />
            If you are not on Windows, contact the exam team. This configuration is for Windows Safe Exam Browser.
          </div>

          <button type="button" onClick={() => go('/')} className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">
            <ArrowLeft size={15} aria-hidden />Back to sign in
          </button>
        </Card>
      </main>
    </div>
  );
}
