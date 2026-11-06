import { useState } from 'react';
import { Plus } from 'lucide-react';
import { api } from '../../lib/api.js';
import { useApi } from '../../hooks/useApi.js';
import { ENDPOINTS } from '../../lib/endpoints.js';
import { ApiErrorState } from '../../components/ContractPending.jsx';
import { Badge, Button, Card, Drawer, Field, Input, PageHeader, TableSkeleton, TableWrap, Td, Th, useToast } from '../../components/ui.jsx';

export default function Employees() {
  const toast = useToast();
  const data = useApi(ENDPOINTS.institution.employees);
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const rows = data.data?.employees || data.data || [];

  const invite = async (e) => {
    e.preventDefault();
    if (!email.trim()) return setErr('Email is required.');
    setBusy(true); setErr('');
    try {
      await api(ENDPOINTS.institution.employees, { method: 'POST', role: 'admin', body: { email: email.trim(), name: name.trim() } });
      toast('Invitation sent.');
      setOpen(false); setEmail(''); setName(''); data.reload();
    } catch (ex) { setErr(ex.message); }
    finally { setBusy(false); }
  };

  return (
    <>
      <PageHeader title="Employees" description="Seats: 2 / 5 / 15 according to plan. Pending invites do not count."
        actions={<Button onClick={() => setOpen(true)}><Plus size={16} />Invite employee</Button>} />
      <Card>
        {data.loading && !data.data && <TableSkeleton />}
        {data.error && <div className="p-4"><ApiErrorState error={data.error} onRetry={data.reload} /></div>}
        {data.data && rows.length === 0 && <p className="p-8 text-center text-sm text-muted">No employees yet. Invite the first employee.</p>}
        {rows.length > 0 && (
          <TableWrap>
            <thead><tr><Th>Name</Th><Th>Email</Th><Th>Role</Th><Th>Status</Th><Th></Th></tr></thead>
            <tbody>
              {rows.map((e) => (
                <tr key={e.id}>
                  <Td className="font-medium">{e.name || '—'}</Td>
                  <Td>{e.email}</Td>
                  <Td><Badge>{e.role || 'employee'}</Badge></Td>
                  <Td><Badge tone={e.status === 'active' ? 'ok' : 'neutral'}>{e.status || '—'}</Badge></Td>
                  <Td><Button size="sm" variant="ghost">Manage</Button></Td>
                </tr>
              ))}
            </tbody>
          </TableWrap>
        )}
      </Card>
      <Drawer open={open} onClose={() => setOpen(false)} title="Invite employee" description="Pending invitations do not consume a seat until accepted.">
        <form onSubmit={invite} className="space-y-4">
          {err && <p role="alert" className="text-sm text-danger-ink">{err}</p>}
          <Field label="Name">{(p) => <Input {...p} value={name} onChange={(e) => setName(e.target.value)} />}</Field>
          <Field label="Email">{(p) => <Input {...p} type="email" value={email} onChange={(e) => setEmail(e.target.value)} />}</Field>
          <Button type="submit" loading={busy} className="w-full">Send invitation</Button>
        </form>
      </Drawer>
    </>
  );
}
