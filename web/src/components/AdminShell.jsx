import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router';
import { CalendarDays, Database, Flag, LogOut, Menu, Radio, Ticket, Trophy, Users, X } from 'lucide-react';
import { auth } from '../lib/api.js';
import { Button, Logo, cx } from './ui.jsx';

const NAV = [
  ['/admin/events', 'Events', CalendarDays],
  ['/admin/roster', 'Roster', Users],
  ['/admin/bank', 'Bank', Database],
  ['/admin/live', 'Live', Radio],
  ['/admin/results', 'Results', Trophy],
  ['/admin/flags', 'Flags', Flag],
  ['/admin/tickets', 'Tickets', Ticket],
];

function SideNav({ onNavigate }) {
  return (
    <nav aria-label="Admin" className="space-y-0.5 px-3">
      {NAV.map(([to, label, Icon]) => (
        <NavLink key={to} to={to} onClick={onNavigate}
          className={({ isActive }) => cx('flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium', isActive ? 'bg-primary-soft text-primary' : 'text-muted hover:bg-slate-100 hover:text-ink')}>
          <Icon size={16} aria-hidden />{label}
        </NavLink>
      ))}
    </nav>
  );
}

export default function AdminLayout() {
  const nav = useNavigate();
  const loc = useLocation();
  const [open, setOpen] = useState(false);
  const p = auth.profile('admin');
  useEffect(() => setOpen(false), [loc.pathname]);
  const logout = () => { auth.clear('admin'); nav('/admin/login', { replace: true }); };

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[208px_1fr]">
      <aside className="sticky top-0 hidden h-screen border-r border-line bg-white pt-4 lg:block">
        <div className="mb-5 px-6"><Logo /></div>
        <SideNav />
      </aside>

      {open && (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true" aria-label="Navigation">
          <div className="absolute inset-0 bg-slate-900/40" onClick={() => setOpen(false)} />
          <div className="relative h-full w-64 bg-white pt-4 shadow-xl">
            <div className="mb-5 flex items-center justify-between px-6"><Logo /><button aria-label="Close navigation" onClick={() => setOpen(false)} className="rounded-md p-1 hover:bg-slate-100"><X size={16} /></button></div>
            <SideNav onNavigate={() => setOpen(false)} />
          </div>
        </div>
      )}

      <div className="min-w-0">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-line bg-white/90 px-4 backdrop-blur lg:px-8">
          <button className="rounded-md p-2 hover:bg-slate-100 lg:hidden" aria-label="Open navigation" onClick={() => setOpen(true)}><Menu size={18} /></button>
          <div className="hidden lg:block" />
          <div className="flex items-center gap-3 text-sm">
            <span className="text-muted">{p?.email}</span>
            <Button variant="ghost" size="sm" onClick={logout}><LogOut size={14} />Log out</Button>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-6 lg:px-8"><Outlet /></main>
      </div>
    </div>
  );
}
