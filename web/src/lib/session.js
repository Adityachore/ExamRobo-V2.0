import { auth } from './api.js';

// UI-only session view. The server remains the authorization authority; this
// module only decides what navigation and buttons are shown.
const STAFF_ROLES = new Set(['owner', 'admin', 'employee']);

function normalizeRole(role) {
  return STAFF_ROLES.has(role) ? role : 'owner';
}

export function staffSession() {
  const profile = auth.profile('admin');
  const role = normalizeRole(profile?.role);
  return {
    profile,
    role,
    isOwner: role === 'owner',
    isAdmin: role === 'admin',
    canManage: role === 'owner' || role === 'admin',
    canManageBilling: role === 'owner' || role === 'admin',
    canManageSettings: role === 'owner' || role === 'admin',
  };
}

export function platformSession() {
  return { profile: auth.profile('platform') };
}

export function hasStaffToken() {
  return !!auth.token('admin');
}

export function hasPlatformToken() {
  return !!auth.token('platform');
}
