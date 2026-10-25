import { useNavigate } from 'react-router';
import { LogOut } from 'lucide-react';
import { auth } from '../lib/api.js';
import { ConnectionBadge } from './ConnectionBadge.jsx';
import { Button, Logo } from './ui.jsx';

export function StudentHeader({ wide = false }) {
  const nav = useNavigate();
  const p = auth.profile('student');
  const logout = () => { auth.clear('student'); nav('/', { replace: true }); };
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-white/95 backdrop-blur">
      <div className={`mx-auto flex h-16 items-center justify-between gap-4 px-4 sm:px-6 ${wide ? 'max-w-5xl' : 'max-w-4xl'}`}>
        <Logo />
        <div className="flex min-w-0 items-center gap-2 text-sm">
          <ConnectionBadge />
          <span className="hidden truncate text-muted md:inline">{p?.email}</span>
          <Button variant="ghost" size="sm" onClick={logout}><LogOut size={14} aria-hidden />Sign out</Button>
        </div>
      </div>
    </header>
  );
}
