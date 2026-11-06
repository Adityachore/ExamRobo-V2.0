import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router';
import {
  Activity, BarChart3, BookOpen, Building2, CalendarDays, CreditCard, Database,
  Flag, GraduationCap, LayoutDashboard, LifeBuoy, LogOut, Menu, Radio, Settings,
  ShieldCheck, Ticket, Trophy, Users, UserCog, X,
} from 'lucide-react';
import { auth } from '../lib/api.js';
import { staffSession } from '../lib/session.js';
import { Button, Logo, cx } from './ui.jsx';

const OPERATIONS = [
  ['/app', 'Dashboard', LayoutDashboard, true],
  ['/app/events', 'Events', CalendarDays, true],
  ['/app/students', 'Students', GraduationCap, true],
  ['/app/questions', 'Question bank', Database, true],
  ['/app/live', 'Live monitor', Radio, true],
  ['/app/results', 'Results', Trophy, true],
  ['/app/flags', 'Flags', Flag, true],
  ['/app/tickets', 'Tickets', Ticket, true],
];

const MANAGEMENT = [
  ['/app/employees', 'Employees', Users, 'manage'],
  ['/app/admin', 'Admin', UserCog, 'owner'],
  ['/app/billing', 'Billing', CreditCard, 'manage'],
  ['/app/activity', 'Activity', Activity, 'manage'],
  ['/app/support-access', 'Support access', LifeBuoy, 'manage'],
  ['/app/settings', 'Settings', Settings, 'manage'],
];

function itemsFor(session) {
  const management = MANAGEMENT.filter(([, , , need]) => {
    if (need === 'owner') return session.isOwner;
    if (need === 'manage') return session.canManage;
    return true;
  });
  return [OPERATIONS, management];
}

function NavItem({ to, label, Icon, end, onNavigate }) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onNavigate}
      className={({ isActive }) =>
        cx(
          'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium',
          isActive ? 'bg-primary-soft text-primary' : 'text-muted hover:bg-slate-100 hover:text-ink',
        )
      }
    >
      <Icon size={16} aria-hidden />{label}
    </NavLink>
  );
}

function NavGroups({ session, onNavigate }) {
  const [operations, management] = itemsFor(session);
  return (
    <nav aria-label="Institution" className="space-y-4 px-3">
      <div className="space-y-0.5">
        {operations.map(([to, label, Icon, end]) => (
          <NavItem key={to} to={to} label={label} Icon={Icon} end={end} onNavigate={onNavigate} />
        ))}
      </div>
      {management.length > 0 && (
        <div className="space-y-0.5 border-t border-line pt-3">
          <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">Manage</p>
          {management.map(([to, label, Icon, end]) => (
            <NavItem key={to} to={to} label={label} Icon={Icon} end={end} onNavigate={onNavigate} />
          ))}
        </div>
      )}
    </nav>
  );
}

export default function AppShell() {
  const nav = useNavigate();
  const loc = useLocation();
  const [open, setOpen] = useState(false);
  const session = staffSession();
  const profile = session.profile;
  useEffect(() => setOpen(false), [loc.pathname]);
  const logout = () => { auth.clear('admin'); nav('/login', { replace: true }); };
  const roleLabel = session.role === 'owner' ? 'Owner' : session.role === 'admin' ? 'Admin' : 'Employee';

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[232px_1fr]">
      <aside className="sticky top-0 hidden h-screen border-r border-line bg-white pt-4 lg:block">
        <div className="mb-5 px-6"><Logo /></div>
        <NavGroups session={session} />
      </aside>

      {open && (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true" aria-label="Navigation">
          <div className="absolute inset-0 bg-slate-900/40" onClick={() => setOpen(false)} />
          <div className="relative h-full w-72 overflow-y-auto bg-white pt-4 shadow-xl">
            <div className="mb-5 flex items-center justify-between px-6">
              <Logo />
              <button aria-label="Close navigation" onClick={() => setOpen(false)} className="rounded-md p-1 hover:bg-slate-100">
                <X size={16} />
              </button>
            </div>
            <NavGroups session={session} onNavigate={() => setOpen(false)} />
          </div>
        </div>
      )}

      <div className="min-w-0">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-line bg-white/90 px-4 backdrop-blur lg:px-8">
          <button className="rounded-md p-2 hover:bg-slate-100 lg:hidden" aria-label="Open navigation" onClick={() => setOpen(true)}>
            <Menu size={18} />
          </button>
          <div className="hidden items-center gap-2 text-xs text-muted lg:flex">
            <ShieldCheck size={14} aria-hidden />
            <span>Institution workspace</span>
          </div>
          <div className="flex min-w-0 items-center gap-3 text-sm">
            <span className="hidden max-w-48 truncate text-muted sm:inline">{profile?.email}</span>
            <span className="rounded-full bg-primary-soft px-2 py-0.5 text-xs font-medium text-primary">{roleLabel}</span>
            <Button variant="ghost" size="sm" onClick={logout}><LogOut size={14} aria-hidden />Log out</Button>
          </div>
        </header>
        <main className="mx-auto max-w-7xl px-4 py-6 lg:px-8"><Outlet /></main>
      </div>
    </div>
  );
}

export function AppShellIcon() {
  return <Building2 size={16} aria-hidden />;
}

export function PlatformShellIcon() {
  return <BarChart3 size={16} aria-hidden />;
}
