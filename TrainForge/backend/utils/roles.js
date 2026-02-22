const TENANT_ROLE_TO_APP_ROLE = {
  MASTER_ADMIN: 'admin',
  GYM_STAFF: 'trainer',
  PERSONAL: 'trainer'
};

function toAppRole(tenantRole) {
  return TENANT_ROLE_TO_APP_ROLE[tenantRole] || 'trainer';
}

function canManage(role) {
  return role === 'admin' || role === 'trainer';
}

module.exports = {
  toAppRole,
  canManage
};
