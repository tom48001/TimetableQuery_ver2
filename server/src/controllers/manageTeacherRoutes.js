import db from '../db.js';
import bcrypt from 'bcrypt';

const MANAGED_ROLES = ['teacher', 'staff'];

function normalizeRole(role) {
  const normalizedRole = role ? role.trim().toLowerCase() : 'teacher';
  return MANAGED_ROLES.includes(normalizedRole) ? normalizedRole : null;
}

export const getAllTeachers = async (req, res) => {
  try {
    const [teachers] = await db.query(
      'SELECT user_id, user_name, email, role FROM user WHERE role IN (?, ?) ORDER BY user_name',
      MANAGED_ROLES
    );
    res.json(teachers);
  } catch (error) {
    console.error('Failed to load users:', error);
    res.status(500).json({ error: 'Failed to load users.' });
  }
};

export const createTeacher = async (req, res) => {
  try {
    const { user_name, email, password, role } = req.body;
    const normalizedRole = normalizeRole(role);

    if (!user_name || !email || !password || !normalizedRole) {
      return res.status(400).json({ error: 'Invalid user data.' });
    }

    const hashed = await bcrypt.hash(password, 10);
    await db.query(
      'INSERT INTO user (user_name, email, password, role) VALUES (?, ?, ?, ?)',
      [user_name, email, hashed, normalizedRole]
    );
    res.json({ message: 'User created successfully.' });
  } catch (error) {
    console.error('Failed to create user:', error);
    res.status(500).json({ error: 'Failed to create user.' });
  }
};

export const updateTeacher = async (req, res) => {
  const { id } = req.params;
  const { user_name, email, role, newPassword } = req.body;
  const normalizedRole = normalizeRole(role);

  if (!user_name || !email || !normalizedRole) {
    return res.status(400).json({ error: 'Invalid user data.' });
  }

  try {
    let query;
    let params;

    if (newPassword) {
      const hashed = await bcrypt.hash(newPassword, 10);
      query = 'UPDATE user SET user_name = ?, email = ?, role = ?, password = ? WHERE user_id = ?';
      params = [user_name, email, normalizedRole, hashed, id];
    } else {
      query = 'UPDATE user SET user_name = ?, email = ?, role = ? WHERE user_id = ?';
      params = [user_name, email, normalizedRole, id];
    }

    await db.query(query, params);
    res.json({ message: 'User updated successfully.' });
  } catch (error) {
    console.error('Failed to update user:', error);
    res.status(500).json({ error: 'Failed to update user.' });
  }
};

export const deleteTeacher = async (req, res) => {
  const { id } = req.params;

  try {
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
    const [rows] = await db.query(
      'SELECT user_id, user_name, email, role FROM user WHERE user_id = ?',
      [id]
    );
    if (!rows.length) return res.status(404).json({ error: 'User not found.' });
    res.json(rows[0]);
  } catch (error) {
    console.error('Failed to load user:', error);
    res.status(500).json({ error: 'Failed to load user.' });
  }
};
