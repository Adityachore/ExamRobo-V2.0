import { Link } from 'react-router';
import { Wrench } from 'lucide-react';
import { Button, Card } from '../../components/ui.jsx';

export default function Maintenance() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-4">
      <Card className="w-full max-w-md p-8 text-center">
        <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-warn-soft text-warn-ink">
          <Wrench size={22} aria-hidden />
        </div>
        <h1 className="text-xl font-semibold">Scheduled maintenance</h1>
        <p className="mt-2 text-sm text-muted">We will be back shortly. No exam data is being changed during this window.</p>
        <div className="mt-6 flex justify-center gap-2">
          <Button onClick={() => window.location.reload()}>Retry</Button>
          <Link to="/"><Button variant="secondary">Home</Button></Link>
        </div>
      </Card>
    </div>
  );
}
