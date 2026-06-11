import db from '../db.js';
import bcrypt from 'bcrypt';
import {
  ensurePermissionsColumn,
  permissionsForUser,
  stringifyPermissions,
  hasPermission
} from '../auth/permissions.js';

const ALL_ROLES = ['teacher', 'staff', 'manager'];
const STAFF_MANAGED_ROLES = ['teacher', 'staff'];

function actorRole(req) {
  return req.user?.role ? req.user.role.trim().toLowerCase() : '';
}

function actorCanManageAll(req) {
  return actorRole(req) === 'manager';
}

function allowedRolesFor(req) {
  return actorCanManageAll(req) ? ALL_ROLES : STAFF_MANAGED_ROLES;
}

function normalizeRole(role, req) {
  const normalizedRole = role ? role.trim().toLowerCase() : 'teacher';
  return allowedRolesFor(req).includes(normalizedRole) ? normalizedRole : null;
}

function canManageUsers(req) {
  return actorCanManageAll(req) || hasPermission(req.user, 'manageUsers');
}

function sanitizePermissions(permissions, role, req) {
  if (!actorCanManageAll(req)) {
    return stringifyPermissions(null, role);
  }
  return stringifyPermissions(permissions, role);
}

export const getAllTeachers = async (req, res) => {
  if (!canManageUsers(req)) return res.status(403).json({ error: 'Permission denied.' });

  try {
    await ensurePermissionsColumn();
    const roles = allowedRolesFor(req);
    const placeholders = roles.map(() => '?').join(', ');
    const [teachers] = await db.query(
      `SELECT user_id, user_name, email, role, permissions FROM user WHERE role IN (${placeholders}) ORDER BY user_name`,
      roles
    );
    res.json(teachers.map(user => ({
      ...user,
      permissions: permissionsForUser(user)
    })));
  } catch (error) {
    console.error('Failed to load users:', error);
    res.status(500).json({ error: 'Failed to load users.' });
  }
};

export const createTeacher = async (req, res) => {
  if (!canManageUsers(req)) return res.status(403).json({ error: 'Permission denied.' });

  try {
    await ensurePermissionsColumn();
    const { user_name, email, password, role, permissions } = req.body;
    const normalizedRole = normalizeRole(role, req);

    if (!user_name || !email || !password || !normalizedRole) {
      return res.status(400).json({ error: 'Invalid user data or role.' });
    }

    const hashed = await bcrypt.hash(password, 10);
    await db.query(
      'INSERT INTO user (user_name, email, password, role, permissions) VALUES (?, ?, ?, ?, ?)',
      [user_name, email, hashed, normalizedRole, sanitizePermissions(permissions, normalizedRole, req)]
    );
    res.json({ message: 'User created successfully.' });
  } catch (error) {
    console.error('Failed to create user:', error);
    res.status(500).json({ error: 'Failed to create user.' });
  }
};

export const updateTeacher = async (req, res) => {
  if (!canManageUsers(req)) return res.status(403).json({ error: 'Permission denied.' });

  const { id } = req.params;
  const { user_name, email, role, newPassword, permissions } = req.body;
  const normalizedRole = normalizeRole(role, req);

  if (!user_name || !email || !normalizedRole) {
    return res.status(400).json({ error: 'Invalid user data or role.' });
  }

  try {
    await ensurePermissionsColumn();
    const [existingRows] = await db.query('SELECT role FROM user WHERE user_id = ?', [id]);
    if (!existingRows.length) return res.status(404).json({ error: 'User not found.' });

    const currentRole = existingRows[0].role ? existingRows[0].role.trim().toLowerCase() : '';
    if (!actorCanManageAll(req) && currentRole === 'manager') {
      return res.status(403).json({ error: 'Only manager can edit manager accounts.' });
    }

    const permissionText = sanitizePermissions(permissions, normalizedRole, req);
    let query;
    let params;

    if (newPassword) {
      const hashed = await bcrypt.hash(newPassword, 10);
      query = 'UPDATE user SET user_name = ?, email = ?, role = ?, permissions = ?, password = ? WHERE user_id = ?';
      params = [user_name, email, normalizedRole, permissionText, hashed, id];
    } else {
      query = 'UPDATE user SET user_name = ?, email = ?, role = ?, permissions = ? WHERE user_id = ?';
      params = [user_name, email, normalizedRole, permissionText, id];
    }

    await db.query(query, params);
    res.json({ message: 'User updated successfully.' });
  } catch (error) {
    console.error('Failed to update user:', error);
    res.status(500).json({ error: 'Failed to update user.' });
  }
};

export const deleteTeacher = async (req, res) => {
  if (!canManageUsers(req)) return res.status(403).json({ error: 'Permission denied.' });

  const { id } = req.params;

  try {
    await ensurePermissionsColumn();
    const [existingRows] = await db.query('SELECT role FROM user WHERE user_id = ?', [id]);
    if (!existingRows.length) return res.status(404).json({ error: 'User not found.' });

    const currentRole = existingRows[0].role ? existingRows[0].role.trim().toLowerCase() : '';
    if (!actorCanManageAll(req) && currentRole === 'manager') {
      return res.status(403).json({ error: 'Only manager can delete manager accounts.' });
    }

    await db.query('DELETE FROM user WHERE user_id = ?', [id]);
    res.json({ message: 'User deleted successfully.' });
  } catch (error) {
    console.error('Failed to delete user:', error);
    res.status(500).json({ error: 'Failed to delete user.' });
  }
};

export const getTeacherById = async (req, res) => {
  const { id } = req.params;

  try {
    await ensurePermissionsColumn();
    const [rows] = await db.query(
      'SELECT user_id, user_name, email, role, permissions FROM user WHERE user_id = ?',
      [id]
    );
    if (!rows.length) return res.status(404).json({ error: 'User not found.' });
    const user = rows[0];
    res.json({ ...user, permissions: permissionsForUser(user) });
  } catch (error) {
    console.error('Failed to load user:', error);
    res.status(500).json({ error: 'Failed to load user.' });
  }
};
