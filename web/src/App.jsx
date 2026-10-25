import { useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router';
import { auth } from './lib/api.js';
import { ToastProvider } from './components/ui.jsx';
import AdminLayout from './components/AdminShell.jsx';
import Login from './pages/student/Login.jsx';
import Waiting from './pages/student/Waiting.jsx';
import Seb from './pages/student/Seb.jsx';
import Exam from './pages/student/Exam.jsx';
import Result from './pages/student/Result.jsx';
import Locked from './pages/student/Locked.jsx';
import AdminLogin from './pages/admin/AdminLogin.jsx';
import Events from './pages/admin/Events.jsx';
import Roster from './pages/admin/Roster.jsx';
import Bank from './pages/admin/Bank.jsx';
import Live from './pages/admin/Live.jsx';
import Results from './pages/admin/Results.jsx';
import Recordings from './pages/admin/Recordings.jsx';
import Flags from './pages/admin/Flags.jsx';
import Tickets from './pages/admin/Tickets.jsx';

/** Route guard. UX only — the server enforces roles on every request. */
function Guard({ role, children }) {
  const nav = useNavigate();
  const loc = useLocation();
  const loginPath = role === 'admin' ? '/admin/login' : '/';
  useEffect(() => {
    const onUnauth = (e) => {
      if (e.detail.role === role) nav(loginPath, { replace: true, state: { message: 'Your session has expired. Please sign in again.' } });
    };
    window.addEventListener('examrobo:unauthorized', onUnauth);
    return () => window.removeEventListener('examrobo:unauthorized', onUnauth);
  }, [role, nav, loginPath]);
  if (!auth.token(role)) return <Navigate to={loginPath} replace state={{ from: loc.pathname }} />;
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/seb" element={<Seb />} />
          <Route path="/waiting" element={<Guard role="student"><Waiting /></Guard>} />
          <Route path="/exam" element={<Guard role="student"><Exam /></Guard>} />
          <Route path="/result" element={<Guard role="student"><Result /></Guard>} />
          {/* Not guarded: the lock screen is shown after the token was cleared. */}
          <Route path="/locked" element={<Locked />} />

          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<Guard role="admin"><AdminLayout /></Guard>}>
            <Route index element={<Navigate to="events" replace />} />
            <Route path="events" element={<Events />} />
            <Route path="roster" element={<Roster />} />
            <Route path="bank" element={<Bank />} />
            <Route path="live" element={<Live />} />
            <Route path="results" element={<Results />} />
            <Route path="recordings" element={<Recordings />} />
            <Route path="flags" element={<Flags />} />
            <Route path="tickets" element={<Tickets />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ToastProvider>
    </BrowserRouter>
  );
}
