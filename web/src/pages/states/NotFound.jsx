import { Link } from 'react-router';
import { Home, ShieldAlert } from 'lucide-react';
import { Button, Card } from '../../components/ui.jsx';

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-4">
      <Card className="w-full max-w-md p-8 text-center">
        <p className="text-6xl font-semibold text-slate-200">404</p>
        <h1 className="mt-2 text-xl font-semibold">Page not found</h1>
        <p className="mt-2 text-sm text-muted">The page you asked for does not exist or you do not have access.</p>
        <div className="mt-6 flex justify-center gap-2">
          <Button variant="secondary" onClick={() => window.history.back()}>Go back</Button>
          <Link to="/"><Button><Home size={14} aria-hidden /> Home</Button></Link>
        </div>
      </Card>
    </div>
  );
}

export function Forbidden() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-4">
      <Card className="w-full max-w-md p-8 text-center">
        <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-danger-soft text-danger-ink">
          <ShieldAlert size={22} aria-hidden />
        </div>
        <h1 className="text-xl font-semibold">Access denied</h1>
        <p className="mt-2 text-sm text-muted">Your role does not allow this action. Ask your institution Owner or Admin.</p>
        <div className="mt-6 flex justify-center gap-2">
          <Link to="/app"><Button>Back to dashboard</Button></Link>
          <Link to="/"><Button variant="secondary">Home</Button></Link>
        </div>
      </Card>
    </div>
  );
}
