const { toAppRole } = require('../utils/roles');

function getTenantRole(req) {
  return String(req.user?.tenantRole || req.user?.tenant_role || '').toUpperCase();
}

function allowRoles(...roles) {
  return (req, _res, next) => {
    if (!req.user) {
      return next({ status: 401, message: 'Unauthorized.' });
    }

    const role = req.user.role || toAppRole(req.user.tenantRole);
    if (!roles.includes(role)) {
      return next({ status: 403, message: 'Insufficient permissions.' });
    }

    return next();
  };
}

function denyTenantRoles(...tenantRoles) {
  const denied = tenantRoles.map((role) => String(role || '').toUpperCase());

  return (req, _res, next) => {
    if (!req.user) {
      return next({ status: 401, message: 'Unauthorized.' });
    }

    const tenantRole = getTenantRole(req);
    if (denied.includes(tenantRole)) {
      return next({ status: 403, message: 'Insufficient permissions for tenant role.' });
    }

    return next();
  };
}

module.exports = { allowRoles, denyTenantRoles };
