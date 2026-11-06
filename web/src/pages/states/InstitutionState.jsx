import { Link } from 'react-router';
import { Card, Button } from '../../components/ui.jsx';

export function InstitutionState({ state = 'suspended' }) {
  const copy = {
    suspended: { title: 'Institution suspended', desc: 'Access is temporarily blocked. Contact platform support.' },
    pending: { title: 'Application under review', desc: 'You will receive an email once a decision is made.' },
    archived: { title: 'Institution archived', desc: 'This tenant is no longer active. Data is retained per policy.' },
    disabled: { title: 'Account disabled', desc: 'This staff account has been disabled. Ask your institution Owner.' },
  }[state] || { title: 'Access unavailable', desc: 'This institution cannot access the workspace right now.' };

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-4">
      <Card className="w-full max-w-md p-8 text-center">
        <h1 className="text-xl font-semibold">{copy.title}</h1>
        <p className="mt-2 text-sm text-muted">{copy.desc}</p>
        <Link to="/login" className="mt-6 inline-block"><Button variant="secondary">Back to sign in</Button></Link>
      </Card>
    </div>
  );
}

export default InstitutionState;
