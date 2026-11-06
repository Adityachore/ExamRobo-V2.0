import { LifeBuoy } from 'lucide-react';
import { ContractPending } from '../../components/ContractPending.jsx';
import { Card, PageHeader } from '../../components/ui.jsx';

export default function SupportAccess() {
  return (
    <>
      <PageHeader title="Support access approvals" description="Platform requests must be scoped, time-bound and explicitly approved." />
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <div className="flex items-start gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary"><LifeBuoy size={18} /></div>
            <div>
              <h2 className="text-sm font-semibold">No pending requests</h2>
              <p className="mt-1 text-sm text-muted">Support access is never implicit. Break-glass actions require a reason and are audited.</p>
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <h2 className="text-sm font-semibold">Policy</h2>
          <p className="mt-2 text-sm text-muted">Approve only the scope and duration you intend. Every grant is logged.</p>
        </Card>
      </div>
      <div className="mt-4">
        <ContractPending title="Support access contract not connected" description="The institution-side approval endpoints are not yet defined in the v2 catalog." />
      </div>
    </>
  );
}
