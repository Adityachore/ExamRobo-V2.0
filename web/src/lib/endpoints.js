// Canonical v2 endpoints. Paths are relative to the existing /api prefix.
// Keeping every URL here is deliberate: the v2 contract is still proposed, so
// renames must be a one-file change, never scattered across pages.
const v2 = (path) => `/v2${path}`;

export function withQuery(path, params = {}) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue;
    search.set(key, String(value));
  }
  const qs = search.toString();
  return qs ? `${path}?${qs}` : path;
}

export const ENDPOINTS = {
  auth: {
    login: v2('/auth/login'),
    logout: v2('/auth/logout'),
    refresh: v2('/auth/refresh'),
    me: v2('/auth/me'),
    passwordForgot: v2('/auth/password/forgot'),
    passwordReset: v2('/auth/password/reset'),
    membershipSelect: v2('/auth/membership/select'),
  },
  public: {
    applications: v2('/public/institution-applications'),
    application: (id) => v2(`/public/institution-applications/${id}`),
    otpRequest: (id) => v2(`/public/institution-applications/${id}/otp/request`),
    otpVerify: (id) => v2(`/public/institution-applications/${id}/otp/verify`),
    resend: (id) => v2(`/public/institution-applications/${id}/resend`),
    status: v2('/public/institution-applications/status'),
  },
  platform: {
    dashboard: v2('/platform/dashboard'),
    applications: (params) => withQuery(v2('/platform/applications'), params),
    application: (id) => v2(`/platform/applications/${id}`),
    approve: (id) => v2(`/platform/applications/${id}/approve`),
    reject: (id) => v2(`/platform/applications/${id}/reject`),
    institutions: (params) => withQuery(v2('/platform/institutions'), params),
    institution: (id) => v2(`/platform/institutions/${id}`),
    institutionState: (id) => v2(`/platform/institutions/${id}/state`),
    plans: v2('/platform/plans'),
    plan: (id) => v2(`/platform/plans/${id}`),
    reconciliation: v2('/platform/billing/reconciliation'),
    supportGrants: v2('/platform/support-grants'),
  },
  institution: {
    profile: v2('/institution/profile'),
    usage: v2('/institution/usage'),
    employees: v2('/institution/employees'),
    employee: (id) => v2(`/institution/employees/${id}`),
    students: (params) => withQuery(v2('/institution/students'), params),
    student: (id) => v2(`/institution/students/${id}`),
    events: v2('/institution/events'),
    event: (id) => v2(`/institution/events/${id}`),
    eventRosterImport: (id) => v2(`/institution/events/${id}/roster/import`),
    questionBank: v2('/institution/question-bank'),
    billing: v2('/institution/billing'),
    billingOrders: v2('/institution/billing/orders'),
    billingVerify: v2('/institution/billing/verify'),
    invoice: (id) => v2(`/institution/billing/invoices/${id}`),
    invoicePdf: (id) => v2(`/institution/billing/invoices/${id}/pdf`),
    audit: v2('/institution/audit'),
  },
  legacy: {
    studentLogin: '/student',
    adminLogin: '/admin',
    events: '/admin/events',
    event: (id) => `/admin/events/${id}`,
    roster: (id) => `/admin/events/${id}/roster`,
    rosterCsv: (id) => `/admin/events/${id}/roster.csv`,
    live: '/admin/live',
    results: '/admin/results',
    flags: '/admin/flags',
    tickets: '/admin/tickets',
    bank: '/bank',
    analytics: '/admin/analytics',
    session: '/admin/session',
    wsTicket: '/ws/ticket',
  },
};
