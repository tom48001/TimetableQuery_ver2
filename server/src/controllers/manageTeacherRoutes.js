import db from '../db.js';
import bcrypt from 'bcrypt';

// 取得老師列表
export const getAllTeachers = async (req, res) => {
  console.log('==== BOB =====');
  const [teachers] = await db.query('SELECT user_id, user_name, email FROM user WHERE role = "teacher"');
  res.json(teachers);
};

// 新增老師
export const createTeacher = async (req, res) => {
  try {
    const { user_name, email, password } = req.body;
    const hashed = await bcrypt.hash(password, 10);
    await db.query(
      'INSERT INTO user (user_name, email, password, role) VALUES (?, ?, ?, "teacher")',
      [user_name, email, hashed]
    );
    res.json({ message: '老師新增成功' });
  } catch (error) {
    console.error('新增老師錯誤:', error);
    res.status(500).json({ error: '新增老師失敗' });
  }
};

// 編輯老師
export const updateTeacher = async (req, res) => {
  const { id } = req.params;
  const { user_name, email, newPassword } = req.body;
  try {
    let query, params;
    if (newPassword) {
      const hashed = await bcrypt.hash(newPassword, 10);
      query = 'UPDATE user SET user_name = ?, email = ?, password = ? WHERE user_id = ?';
      params = [user_name, email, hashed, id];
    } else {
      query = 'UPDATE user SET user_name = ?, email = ? WHERE user_id = ?';
      params = [user_name, email, id];
    }
    await db.query(query, params);
    res.json({ message: '老師更新成功' });
  } catch (error) {
    console.error('更新老師錯誤:', error);
    res.status(500).json({ error: '老師更新失敗' });
  }
};

// 刪除老師 
export const deleteTeacher = async (req, res) => {
  const { id } = req.params;
  await db.query('DELETE FROM user WHERE user_id = ?', [id]);
  res.json({ message: '老師刪除成功' });
};

// 取得老師資料
export const getTeacherById = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.query('SELECT user_id, user_name, email, role FROM user WHERE user_id = ?', [id]);
    if (!rows.length) return res.status(404).json({ error: '找不到老師' });
    res.json(rows[0]);
  } catch (error) {
    console.error('查詢老師失敗:', error);
    res.status(500).json({ error: '資料庫錯誤' });
  }
};
