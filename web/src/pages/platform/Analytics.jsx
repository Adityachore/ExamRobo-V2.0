import { ContractPending } from '../../components/ContractPending.jsx';
import { PageHeader } from '../../components/ui.jsx';

export default function Analytics() {
  return (
    <>
      <PageHeader title="Analytics" description="Aggregate growth and usage. No student-identifying detail." />
      <ContractPending
        title="Analytics contract not connected"
        description="The v2 catalog defines platform analytics as aggregate-only, but the endpoint is not yet implemented. No placeholder metrics are shown."
      />
    </>
  );
}
