import { BrowserRouter, Navigate, Route, Routes } from 'react-router';
import { ToastProvider } from './components/ui.jsx';
import AdminLayout from './components/AdminShell.jsx';
import AppShell from './components/AppShell.jsx';
import PlatformShell from './components/PlatformShell.jsx';
import { ManagersOnly, OwnerOnly, PlatformGuard, StaffGuard } from './components/guards.jsx';

import StudentLogin from './pages/student/Login.jsx';
import Waiting from './pages/student/Waiting.jsx';
import Seb from './pages/student/Seb.jsx';
import Exam from './pages/student/Exam.jsx';
import StudentResult from './pages/student/Result.jsx';
import Locked from './pages/student/Locked.jsx';

import AdminLogin from './pages/admin/AdminLogin.jsx';
import AdminEvents from './pages/admin/Events.jsx';
import Roster from './pages/admin/Roster.jsx';
import Bank from './pages/admin/Bank.jsx';
import Live from './pages/admin/Live.jsx';
import AdminResults from './pages/admin/Results.jsx';
import Flags from './pages/admin/Flags.jsx';
import Tickets from './pages/admin/Tickets.jsx';

import Login from './pages/public/Login.jsx';
import Register from './pages/public/Register.jsx';
import ApplicationStatus from './pages/public/ApplicationStatus.jsx';
import InviteSetup from './pages/public/InviteSetup.jsx';
import PasswordRecover from './pages/public/PasswordRecover.jsx';
import Privacy from './pages/legal/Privacy.jsx';
import Terms from './pages/legal/Terms.jsx';

import PlatformLogin from './pages/platform/Login.jsx';
import PlatformDashboard from './pages/platform/Dashboard.jsx';
import RegistrationsQueue from './pages/platform/RegistrationsQueue.jsx';
import RegistrationReview from './pages/platform/RegistrationReview.jsx';
import Institutions from './pages/platform/Institutions.jsx';
import InstitutionDetail from './pages/platform/InstitutionDetail.jsx';
import Plans from './pages/platform/Plans.jsx';
import Revenue from './pages/platform/Revenue.jsx';
import Analytics from './pages/platform/Analytics.jsx';
import AuditAlerts from './pages/platform/AuditAlerts.jsx';
import PlatformSettings from './pages/platform/Settings.jsx';

import Dashboard from './pages/app/Dashboard.jsx';
import Onboarding from './pages/app/Onboarding.jsx';
import Events from './pages/app/Events.jsx';
import EventWorkspace from './pages/app/EventWorkspace.jsx';
import Students from './pages/app/Students.jsx';
import StudentDetail from './pages/app/StudentDetail.jsx';
import QuestionBank from './pages/app/QuestionBank.jsx';
import AppLive from './pages/app/Live.jsx';
import AppResults from './pages/app/Results.jsx';
import AppFlags from './pages/app/Flags.jsx';
import AppTickets from './pages/app/Tickets.jsx';
import Employees from './pages/app/Employees.jsx';
import AdminManagement from './pages/app/AdminManagement.jsx';
import Billing from './pages/app/Billing.jsx';
import Activity from './pages/app/Activity.jsx';
import SupportAccess from './pages/app/SupportAccess.jsx';
import Settings from './pages/app/Settings.jsx';

import NotFound, { Forbidden } from './pages/states/NotFound.jsx';
import Maintenance from './pages/states/Maintenance.jsx';
import PlanLimit from './pages/states/PlanLimit.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/application/status" element={<ApplicationStatus />} />
          <Route path="/invite/:token" element={<InviteSetup />} />
          <Route path="/password/recover" element={<PasswordRecover />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />

          {/* Platform */}
          <Route path="/platform/login" element={<PlatformLogin />} />
          <Route path="/platform" element={<PlatformGuard><PlatformShell /></PlatformGuard>}>
            <Route index element={<PlatformDashboard />} />
            <Route path="registrations" element={<RegistrationsQueue />} />
            <Route path="registrations/:id" element={<RegistrationReview />} />
            <Route path="institutions" element={<Institutions />} />
            <Route path="institutions/:id" element={<InstitutionDetail />} />
            <Route path="plans" element={<Plans />} />
            <Route path="revenue" element={<Revenue />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="audit-alerts" element={<AuditAlerts />} />
            <Route path="settings" element={<PlatformSettings />} />
          </Route>

          {/* Institution workspace */}
          <Route path="/app" element={<StaffGuard><AppShell /></StaffGuard>}>
            <Route index element={<Dashboard />} />
            <Route path="onboarding" element={<OwnerOnly><Onboarding /></OwnerOnly>} />
            <Route path="events" element={<Events />} />
            <Route path="events/:id" element={<EventWorkspace />} />
            <Route path="students" element={<Students />} />
            <Route path="students/:id" element={<StudentDetail />} />
            <Route path="questions" element={<QuestionBank />} />
            <Route path="live" element={<AppLive />} />
            <Route path="results" element={<AppResults />} />
            <Route path="flags" element={<AppFlags />} />
            <Route path="tickets" element={<AppTickets />} />
            <Route path="employees" element={<ManagersOnly><Employees /></ManagersOnly>} />
            <Route path="admin" element={<OwnerOnly><AdminManagement /></OwnerOnly>} />
            <Route path="billing" element={<ManagersOnly><Billing /></ManagersOnly>} />
            <Route path="activity" element={<ManagersOnly><Activity /></ManagersOnly>} />
            <Route path="support-access" element={<ManagersOnly><SupportAccess /></ManagersOnly>} />
            <Route path="settings" element={<ManagersOnly><Settings /></ManagersOnly>} />
          </Route>

          {/* Student examination flow (v1.5, preserved) */}
          <Route path="/" element={<StudentLogin />} />
          <Route path="/seb" element={<Seb />} />
          <Route path="/waiting" element={<Waiting />} />
          <Route path="/exam" element={<Exam />} />
          <Route path="/result" element={<StudentResult />} />
          <Route path="/locked" element={<Locked />} />

          {/* Legacy v1.5 admin workspace, kept until v2 parity */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="events" replace />} />
            <Route path="events" element={<AdminEvents />} />
            <Route path="roster" element={<Roster />} />
            <Route path="bank" element={<Bank />} />
            <Route path="live" element={<Live />} />
            <Route path="results" element={<AdminResults />} />
            <Route path="flags" element={<Flags />} />
            <Route path="tickets" element={<Tickets />} />
          </Route>

          {/* Shared states */}
          <Route path="/403" element={<Forbidden />} />
          <Route path="/maintenance" element={<Maintenance />} />
          <Route path="/plan-limit" element={<PlanLimit />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </ToastProvider>
    </BrowserRouter>
  );
}
