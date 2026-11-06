import { ContractPending } from '../../components/ContractPending.jsx';
import { PageHeader } from '../../components/ui.jsx';

export default function PlatformSettings() {
  return (
    <>
      <PageHeader title="Platform settings" description="Support-access policy, break-glass rules and platform operators." />
      <ContractPending
        title="Platform settings contract not connected"
        description="The settings endpoint is not yet implemented. No support policy changes can be made from this screen until it is connected."
      />
    </>
  );
}
