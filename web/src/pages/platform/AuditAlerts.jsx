import { ContractPending } from '../../components/ContractPending.jsx';
import { PageHeader } from '../../components/ui.jsx';

export default function AuditAlerts() {
  return (
    <>
      <PageHeader title="Audit & alerts" description="Platform audit stream, security alerts and support-access log." />
      <ContractPending
        title="Audit contract not connected"
        description="The audit and alert endpoints are not yet implemented. This screen will show the immutable event stream and denied-access log when connected."
      />
    </>
  );
}
