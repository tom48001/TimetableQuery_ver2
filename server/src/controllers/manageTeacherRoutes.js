import { passwordError } from '../auth/passwordPolicy.js';
import { subjectHeadIds, validateHeadSubjects } from '../utils/subjectHeadSubjects.js';
import db from '../db.js';
import bcrypt from 'bcrypt';
import { ensureTeacherRosterSchema, teacherNumber } from '../utils/teacherRoster.js';
import { linkTeacherAccount, autoLinkTeacherAccount, linkError } from '../utils/teacherAccountLink.js';
import {
  ensurePermissionsColumn,
  permissionsForUser,
  stringifyPermissions,
  hasPermission
} from '../auth/permissions.js';

const ALL_ROLES = ['teacher', 'subject_head', 'staff', 'manager'];
const STAFF_MANAGED_ROLES = ['teacher', 'subject_head', 'staff'];
let accountDeletionSchemaReady = false;

async function ensureAccountDeletionSchema() {
  if (accountDeletionSchemaReady) return;
  const [constraints] = await db.query(`
    SELECT CONSTRAINT_NAME, DELETE_RULE
    FROM information_schema.REFERENTIAL_CONSTRAINTS
    WHERE CONSTRAINT_SCHEMA = DATABASE()
      AND TABLE_NAME = 'teacher'
      AND REFERENCED_TABLE_NAME = 'user'
  `);
  const current = constraints[0];
  if (current && current.DELETE_RULE !== 'SET NULL') {
    await db.query(`ALTER TABLE teacher DROP FOREIGN KEY \`${current.CONSTRAINT_NAME}\``);
  }
  await db.query('ALTER TABLE teacher MODIFY COLUMN user_id BIGINT NULL');
  if (!current || current.DELETE_RULE !== 'SET NULL') {
    await db.query(
      'ALTER TABLE teacher ADD CONSTRAINT fk_teacher_user_account FOREIGN KEY (user_id) REFERENCES user(user_id) ON DELETE SET NULL'
    );
  }
  accountDeletionSchemaReady = true;
}

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

function accountErrorResponse(res, error, fallback) {
  if (error.status) return res.status(error.status).json({ error: error.message });
  if (error.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'Email or teacher link is already in use.' });
  if (['ER_LOCK_DEADLOCK', 'ER_LOCK_WAIT_TIMEOUT'].includes(error.code)) {
    return res.status(409).json({ error: 'Another account update is in progress. Refresh and try again.' });
  }
  return res.status(500).json({ error: fallback });
}

export const getTeacherLinkOptions = async (req, res) => {
  if (!canManageUsers(req)) return res.status(403).json({ error: 'Permission denied.' });
  try {
    await ensureTeacherRosterSchema(db);
    const roles = allowedRolesFor(req);
    const [rows] = await db.query(`
      SELECT t.teacher_id, t.teacher_code, t.teacher_name, t.user_id, t.status, t.source_login, t.english_name, t.chinese_name,
        (SELECT COUNT(*) FROM timetable tt WHERE tt.teacher_id=t.teacher_id) AS lesson_count
      FROM teacher t LEFT JOIN user u ON u.user_id=t.user_id
      WHERE t.user_id IS NULL OR u.role IN (?)
      ORDER BY t.teacher_code, t.teacher_name`, [roles]);
    return res.json(rows.map(row => ({ ...row, teacher_number: teacherNumber(row.teacher_id) })));
  } catch (error) {
    return accountErrorResponse(res, error, 'Failed to load teacher choices.');
  }
};
export const getAllTeachers = async (req, res) => {
  if (!canManageUsers(req)) return res.status(403).json({ error: 'Permission denied.' });

  try {
    await ensurePermissionsColumn();
    await ensureTeacherRosterSchema(db);
    const roles = allowedRolesFor(req);
    const placeholders = roles.map(() => '?').join(', ');
    const [teachers] = await db.query(
      `SELECT u.user_id, u.user_name, u.email, u.role, u.permissions, u.subject_head_subject_id, u.subject_head_subject_ids,
         t.teacher_id, t.teacher_code, t.teacher_name, t.source_login, t.english_name, t.chinese_name
       FROM user u LEFT JOIN teacher t ON t.user_id = u.user_id
       WHERE u.role IN (${placeholders}) ORDER BY u.user_name`,
      roles
    );
    res.json(teachers.map(user => ({
      ...user,
      subject_head_subject_ids: subjectHeadIds(user),
      teacher_number: teacherNumber(user.teacher_id),
      permissions: permissionsForUser(user)
    })));
  } catch (error) {
    console.error('Failed to load users:', error);
    res.status(500).json({ error: 'Failed to load users.' });
  }
};

export const createTeacher = async (req, res) => {
  if (!canManageUsers(req)) return res.status(403).json({ error: 'Permission denied.' });

  let conn;
  try {
    await ensurePermissionsColumn();
    await ensureTeacherRosterSchema(db);
    const { user_name, email, password, role, permissions } = req.body;
    const normalizedRole = normalizeRole(role, req);

    const headSubjectIds = normalizedRole === 'subject_head' ? subjectHeadIds(req.body) : [];
  const headSubjectId = headSubjectIds[0] || null;
    if (!user_name || !email || !normalizedRole || (normalizedRole === 'subject_head' && !headSubjectId)) {
      return res.status(400).json({ error: 'Invalid user data or role.' });
    }

    if (normalizedRole === 'subject_head' && !await validateHeadSubjects(db, headSubjectIds)) return res.status(400).json({ error: 'Select valid managed subjects.' });
    if (password !== undefined && password !== null && password !== '') {
      const error = passwordError(password);
      if (error) return res.status(400).json({ error });
    }
    const hashed = password ? await bcrypt.hash(password, 10) : null;
    const permissionText = sanitizePermissions(permissions, normalizedRole, req);
    conn = await db.getConnection();
    await conn.beginTransaction();
    const [result] = await conn.query(
      'INSERT INTO user (user_name, email, password, role, permissions, subject_head_subject_id, subject_head_subject_ids) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [user_name, email, hashed, normalizedRole, permissionText, headSubjectId, JSON.stringify(headSubjectIds)]
    );
    await linkTeacherAccount(conn, result.insertId, req.body.teacher_id);
    if (req.body.teacher_id === undefined) await autoLinkTeacherAccount(conn, result.insertId);
    await conn.commit();
    res.json({ message: 'User created successfully.' });
  } catch (error) {
    if (conn) await conn.rollback();
    console.error('Failed to create user:', error);
    accountErrorResponse(res, error, 'Failed to create user.');
  } finally {
    if (conn) conn.release();
  }
};

export const updateTeacher = async (req, res) => {
  if (!canManageUsers(req)) return res.status(403).json({ error: 'Permission denied.' });

  const { id } = req.params;
  const { user_name, email, role, newPassword, permissions } = req.body;
  const normalizedRole = normalizeRole(role, req);
  const headSubjectIds = normalizedRole === 'subject_head' ? subjectHeadIds(req.body) : [];
  const headSubjectId = headSubjectIds[0] || null;

  if (!user_name || !email || !normalizedRole || (normalizedRole === 'subject_head' && !headSubjectId)) {
    return res.status(400).json({ error: 'Invalid user data or role.' });
  }

  if (newPassword !== undefined && newPassword !== null && newPassword !== '') {
    const error = passwordError(newPassword);
    if (error) return res.status(400).json({ error });
  }
  let conn;
  try {
    await ensurePermissionsColumn();
    if (normalizedRole === 'subject_head' && !await validateHeadSubjects(db, headSubjectIds)) return res.status(400).json({ error: 'Select valid managed subjects.' });
    await ensureTeacherRosterSchema(db);
    await ensureAccountDeletionSchema();
    conn = await db.getConnection();
    await conn.beginTransaction();
    const [existingRows] = await conn.query('SELECT role FROM user WHERE user_id = ? FOR UPDATE', [id]);
    if (!existingRows.length) throw linkError(404, 'User not found.');

    const currentRole = existingRows[0].role ? existingRows[0].role.trim().toLowerCase() : '';
    if (!actorCanManageAll(req) && currentRole === 'manager') {
      throw linkError(403, 'Only manager can edit manager accounts.');
    }

    const permissionText = sanitizePermissions(permissions, normalizedRole, req);
    let query;
    let params;

    if (newPassword) {
      const hashed = await bcrypt.hash(newPassword, 10);
      query = 'UPDATE user SET user_name = ?, email = ?, role = ?, permissions = ?, subject_head_subject_id = ?, subject_head_subject_ids = ?, password = ? WHERE user_id = ?';
      params = [user_name, email, normalizedRole, permissionText, headSubjectId, JSON.stringify(headSubjectIds), hashed, id];
    } else {
      query = 'UPDATE user SET user_name = ?, email = ?, role = ?, permissions = ?, subject_head_subject_id = ?, subject_head_subject_ids = ? WHERE user_id = ?';
      params = [user_name, email, normalizedRole, permissionText, headSubjectId, JSON.stringify(headSubjectIds), id];
    }

    await conn.query(query, params);
    await linkTeacherAccount(conn, id, req.body.teacher_id);
    if (req.body.teacher_id === undefined) await autoLinkTeacherAccount(conn, id);
    await conn.commit();
    res.json({ message: 'User updated successfully.' });
  } catch (error) {
    if (conn) await conn.rollback();
    console.error('Failed to update user:', error);
    accountErrorResponse(res, error, 'Failed to update user.');
  } finally {
    if (conn) conn.release();
  }
};

export const deleteTeacher = async (req, res) => {
  if (!canManageUsers(req)) return res.status(403).json({ error: 'Permission denied.' });

  const { id } = req.params;

  try {
    await ensurePermissionsColumn();
    await ensureAccountDeletionSchema();
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
      'SELECT user_id, user_name, email, role, permissions, subject_head_subject_id FROM user WHERE user_id = ?',
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
