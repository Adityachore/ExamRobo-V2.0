import { Link } from 'react-router';

export default function Terms() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-semibold">Terms of Service</h1>
      <p className="mt-2 text-sm text-muted">Version 2.0 · Effective 1 Nov 2026</p>
      <div className="mt-8 space-y-6 text-sm leading-relaxed text-ink">
        <p>By creating an account or using the service you agree to these terms.</p>
        <section>
          <h2 className="text-base font-semibold">1. Service</h2>
          <p className="mt-2 text-muted">We provide a multi-tenant online examination and proctoring platform.</p>
        </section>
        <section>
          <h2 className="text-base font-semibold">2. Acceptable use</h2>
          <p className="mt-2 text-muted">Institutions must not attempt to circumvent integrity controls or share access credentials.</p>
        </section>
        <section>
          <h2 className="text-base font-semibold">3. Plans &amp; payment</h2>
          <p className="mt-2 text-muted">Fees are billed monthly in advance. Failure to pay results in read-only mode after the current period.</p>
        </section>
        <section>
          <h2 className="text-base font-semibold">4. Limitation of liability</h2>
          <p className="mt-2 text-muted">The service is provided as-is. We are not liable for exam outcomes or institutional decisions.</p>
        </section>
      </div>
      <Link className="mt-8 inline-block text-sm font-medium text-primary hover:underline" to="/login">Back to sign in</Link>
    </div>
  );
}
