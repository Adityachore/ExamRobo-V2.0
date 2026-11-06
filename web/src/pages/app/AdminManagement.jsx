import { ShieldCheck, UserCog } from 'lucide-react';
import { ContractPending } from '../../components/ContractPending.jsx';
import { Card, PageHeader } from '../../components/ui.jsx';

export default function AdminManagement() {
  return (
    <>
      <PageHeader title="Admin management" description="Exactly one Admin slot. Only the Owner can invite, replace or disable." />
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <div className="flex items-start gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary"><UserCog size={18} /></div>
            <div>
              <h2 className="text-sm font-semibold">Single Admin slot</h2>
              <p className="mt-1 text-sm text-muted">A pending Admin invitation reserves the slot. Disabling the Admin frees it.</p>
            </div>
          </div>
          <div className="mt-5 rounded-lg border border-line bg-canvas/60 p-4 text-sm">
            <p className="font-medium">No Admin assigned</p>
            <p className="mt-1 text-muted">Admin management will populate when its API contract is connected.</p>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-2 text-sm font-semibold"><ShieldCheck size={16} /> Owner-only</div>
          <p className="mt-2 text-sm text-muted">An Admin cannot create another Admin. Every change is audited.</p>
        </Card>
      </div>
      <div className="mt-4">
        <ContractPending title="Admin slot contract not connected" description="The v2 catalog does not yet define the Admin-slot invite/replace/disable endpoints." />
      </div>
    </>
  );
}
