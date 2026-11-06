import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router';
import {
  Activity, BarChart3, Building2, CreditCard, LayoutDashboard, LifeBuoy,
  LogOut, Menu, Settings, ShieldCheck, UserCog, Users, X,
} from 'lucide-react';
import { auth } from '../lib/api.js';
import { platformSession } from '../lib/session.js';
import { Button, Logo, cx } from './ui.jsx';

const NAV = [
  ['/platform', 'Dashboard', LayoutDashboard, true],
  ['/platform/registrations', 'Registrations', Users],
  ['/platform/institutions', 'Institutions', Building2],
  ['/platform/plans', 'Plans', CreditCard],
  ['/platform/revenue', 'Revenue', BarChart3],
  ['/platform/analytics', 'Analytics', Activity],
  ['/platform/audit-alerts', 'Audit & alerts', ShieldCheck],
  ['/platform/settings', 'Settings', Settings],
];

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

function SideNav({ onNavigate }) {
  return (
    <nav aria-label="Platform" className="space-y-0.5 px-3">
      {NAV.map(([to, label, Icon, end]) => (
        <NavItem key={to} to={to} label={label} Icon={Icon} end={end} onNavigate={onNavigate} />
      ))}
    </nav>
  );
}

export default function PlatformShell() {
  const nav = useNavigate();
  const loc = useLocation();
  const [open, setOpen] = useState(false);
  const { profile } = platformSession();
  useEffect(() => setOpen(false), [loc.pathname]);
  const logout = () => { auth.clear('platform'); nav('/platform/login', { replace: true }); };

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[224px_1fr]">
      <aside className="sticky top-0 hidden h-screen border-r border-line bg-white pt-4 lg:block">
        <div className="mb-5 px-6"><Logo sub="Platform" /></div>
        <SideNav />
        <div className="mx-4 mt-6 rounded-lg border border-line bg-canvas/70 p-3 text-xs text-muted">
          <div className="flex items-center gap-2 font-medium text-body"><ShieldCheck size={14} /> Super Admin</div>
          <p className="mt-1 leading-relaxed">Aggregate data only. Tenant detail requires a scoped support grant.</p>
        </div>
      </aside>

      {open && (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true" aria-label="Navigation">
          <div className="absolute inset-0 bg-slate-900/40" onClick={() => setOpen(false)} />
          <div className="relative h-full w-72 overflow-y-auto bg-white pt-4 shadow-xl">
            <div className="mb-5 flex items-center justify-between px-6">
              <Logo sub="Platform" />
              <button aria-label="Close navigation" onClick={() => setOpen(false)} className="rounded-md p-1 hover:bg-slate-100">
                <X size={16} />
              </button>
            </div>
            <SideNav onNavigate={() => setOpen(false)} />
          </div>
        </div>
      )}

      <div className="min-w-0">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-line bg-white/90 px-4 backdrop-blur lg:px-8">
          <button className="rounded-md p-2 hover:bg-slate-100 lg:hidden" aria-label="Open navigation" onClick={() => setOpen(true)}>
            <Menu size={18} />
          </button>
          <div className="hidden items-center gap-2 text-xs text-muted lg:flex">
            <UserCog size={14} aria-hidden />
            <span>Platform administration</span>
          </div>
          <div className="flex min-w-0 items-center gap-3 text-sm">
            <span className="hidden max-w-48 truncate text-muted sm:inline">{profile?.email}</span>
            <Button variant="ghost" size="sm" onClick={logout}><LogOut size={14} aria-hidden />Log out</Button>
          </div>
        </header>
        <main className="mx-auto max-w-7xl px-4 py-6 lg:px-8"><Outlet /></main>
      </div>
    </div>
  );
}

export function PlatformHelpLink() {
  return <LifeBuoy size={14} aria-hidden />;
}
