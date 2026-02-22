const ROUTES_BY_SCOPE = {
  MASTER: new Set([
    'dashboard',
    'clients',
    'payments',
    'tickets',
    'subscription',
    'admin'
  ]),
  GYM: new Set([
    'dashboard',
    'onboarding',
    'challenges',
    'services',
    'students',
    'feedback',
    'settings',
    'ranking',
    'tickets',
    'subscription'
  ]),
  PERSONAL: new Set([
    'dashboard',
    'onboarding',
    'challenges',
    'services',
    'students',
    'feedback',
    'settings',
    'ranking',
    'tickets',
    'subscription'
  ]),
  STUDENT: new Set([
    'dashboard',
    'challenges',
    'ranking',
    'settings',
    'tickets'
  ])
};

export function getAccessScope(user) {
  const tenantRole = String(user?.tenant_role || '').toUpperCase();
  if (tenantRole === 'MASTER_ADMIN') return 'MASTER';
  if (tenantRole === 'GYM_STAFF') return 'GYM';
  if (tenantRole === 'PERSONAL') return 'PERSONAL';
  return String(user?.role || '').toLowerCase() === 'client' ? 'STUDENT' : 'PERSONAL';
}

export function canAccessRoute(user, routeKey) {
  const scope = getAccessScope(user);
  return ROUTES_BY_SCOPE[scope]?.has(routeKey) || false;
}

