import { Role } from '../../modules/user/core/enums/user.enum';

// Roles con autoridad de nivel Manager o superior
export const MANAGER_ROLES = [Role.SUPER_ADMIN, Role.MANAGER];

// Roles con autoridad de nivel Admin o superior
export const ADMIN_ROLES = [Role.SUPER_ADMIN, Role.MANAGER, Role.ADMIN];

// Roles con función de Staff (no cascada jerárquica — los roles son aditivos)
export const STAFF_ROLES = [Role.SUPER_ADMIN, Role.STAFF];

// Todos los roles operacionales (para rutas que cualquier empleado necesita)
export const WORKFORCE_ROLES = [
  Role.SUPER_ADMIN,
  Role.MANAGER,
  Role.ADMIN,
  Role.STAFF,
];

export const hasAnyRole = (userRoles: Role[], allowedRoles: Role[]) =>
  allowedRoles.some(role => userRoles.includes(role));

export const isSuperAdmin = (r: Role[]) => r.includes(Role.SUPER_ADMIN);

// isManager: tiene autoridad de nivel Manager (SuperAdmin también puede)
export const isManager = (r: Role[]) =>
  MANAGER_ROLES.some(role => r.includes(role));

// isAdmin: tiene autoridad de nivel Admin (SuperAdmin y Manager también pueden)
export const isAdmin = (r: Role[]) =>
  ADMIN_ROLES.some(role => r.includes(role));

// isStaff: tiene rol Staff explícitamente (o SuperAdmin)
// Admin/Manager NO son Staff a menos que también tengan el rol Staff
export const isStaff = (r: Role[]) =>
  r.includes(Role.SUPER_ADMIN) || r.includes(Role.STAFF);
