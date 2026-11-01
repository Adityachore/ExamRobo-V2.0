import { useNavigate } from 'react-router';
import { LogOut } from 'lucide-react';
import { auth } from '../lib/api.js';
import { ConnectionBadge } from './ConnectionBadge.jsx';
import { Button, Logo } from './ui.jsx';

export function StudentHeader({ wide = false }) {
  const nav = useNavigate();
  const p = auth.profile('student');
  const logout = () => { auth.clear('student'); nav('/', { replace: true }); };
  const initial = (p?.name || p?.email || '?')[0].toUpperCase();
  return (
    <header className="sticky top-0 z-30 border-b border-white/60 bg-white/60 backdrop-blur-xl">
      <div className={`mx-auto flex h-16 items-center justify-between gap-4 px-4 sm:px-6 ${wide ? 'max-w-5xl' : 'max-w-4xl'}`}>
        <Logo />
        <div className="flex min-w-0 items-center gap-2 text-sm">
          <ConnectionBadge />
          {p?.email && <span className="hidden min-w-0 items-center gap-2 rounded-full border border-line bg-white/80 py-1 pl-1 pr-3 sm:flex"><span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary-soft text-xs font-semibold text-primary">{initial}</span><span className="truncate text-muted">{p.email}</span></span>}
          <Button variant="ghost" size="sm" onClick={logout}><LogOut size={14} aria-hidden />Sign out</Button>
        </div>
      </div>
    </header>
  );
}
