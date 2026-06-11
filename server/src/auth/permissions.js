import db from '../db.js';

export const ALL_PERMISSION_KEYS = [
  'timetable',
  'nominations',
  'changePassword',
  'manageUsers',
  'manageStudents',
  'importTimetable'
];

export const DEFAULT_ROLE_PERMISSIONS = {
  teacher: {
    timetable: true,
    nominations: true,
    changePassword: true,
    manageUsers: false,
    manageStudents: false,
    importTimetable: false
  },
  staff: {
    timetable: true,
    nominations: true,
    changePassword: false,
    manageUsers: true,
    manageStudents: false,
    importTimetable: false
  },
  manager: {
    timetable: true,
    nominations: true,
    changePassword: false,
    manageUsers: true,
    manageStudents: true,
    importTimetable: true
  }
};

let permissionsColumnReady = false;

export async function ensurePermissionsColumn() {
  if (permissionsColumnReady) return;

  try {
    await db.query('ALTER TABLE user ADD COLUMN permissions TEXT NULL');
  } catch (error) {
    if (error.code !== 'ER_DUP_FIELDNAME' && error.errno !== 1060) {
      throw error;
    }
  }

  permissionsColumnReady = true;
}

export function normalizeRole(role) {
  const normalized = role ? String(role).trim().toLowerCase() : 'teacher';
  return DEFAULT_ROLE_PERMISSIONS[normalized] ? normalized : 'teacher';
}

export function parsePermissions(value, role = 'teacher') {
  const base = { ...DEFAULT_ROLE_PERMISSIONS[normalizeRole(role)] };

  if (!value) return base;

  try {
    const parsed = typeof value === 'string' ? JSON.parse(value) : value;
    ALL_PERMISSION_KEYS.forEach(key => {
      if (Object.prototype.hasOwnProperty.call(parsed, key)) {
        base[key] = Boolean(parsed[key]);
      }
    });
  } catch {
    return base;
  }

  return base;
}

export function stringifyPermissions(value, role = 'teacher') {
  return JSON.stringify(parsePermissions(value, role));
}

export function permissionsForUser(user) {
  return parsePermissions(user?.permissions, user?.role);
}

export function hasPermission(user, permission) {
  const role = normalizeRole(user?.role);
  if (role === 'manager') return true;
  return Boolean(permissionsForUser(user)[permission]);
}

export function requirePermission(permission) {
  return (req, res, next) => {
    if (hasPermission(req.user, permission)) return next();
    return res.status(403).json({ error: 'Permission denied.' });
  };
}
