import { Link } from 'react-router';

export default function Privacy() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-semibold">Privacy Notice</h1>
      <p className="mt-2 text-sm text-muted">Version 2.0 · Effective 1 Nov 2026</p>
      <div className="mt-8 space-y-6 text-sm leading-relaxed text-ink">
        <p>This notice explains how we collect, use and protect personal data when institutions and students use the platform.</p>
        <section>
          <h2 className="text-base font-semibold">1. Data we process</h2>
          <p className="mt-2 text-muted">Account data, exam attempts, proctoring events, and technical logs required for integrity and support.</p>
        </section>
        <section>
          <h2 className="text-base font-semibold">2. Purpose</h2>
          <p className="mt-2 text-muted">To deliver secure online examinations, detect misconduct, provide results to the institution, and meet legal obligations.</p>
        </section>
        <section>
          <h2 className="text-base font-semibold">3. Retention</h2>
          <p className="mt-2 text-muted">Exam data is retained according to the institution&apos;s plan and applicable law. Platform logs follow a fixed retention schedule.</p>
        </section>
        <section>
          <h2 className="text-base font-semibold">4. Your rights</h2>
          <p className="mt-2 text-muted">Institution administrators can export or request deletion of their tenant data subject to legal holds.</p>
        </section>
        <p className="border-t border-line pt-6 text-xs text-muted">Contact privacy@platform.example for requests.</p>
      </div>
      <Link className="mt-8 inline-block text-sm font-medium text-primary hover:underline" to="/login">Back to sign in</Link>
    </div>
  );
}
